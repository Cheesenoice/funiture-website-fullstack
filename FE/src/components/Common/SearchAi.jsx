import React, { useState, useEffect, useRef } from "react";
import { SendHorizonal, X, Bot, Plus } from "lucide-react";
import { ResizableBox } from "react-resizable";
import Draggable from "react-draggable";
import debounce from "lodash.debounce";
import SuggestionCard from "./SuggestionCard";
import "react-resizable/css/styles.css";

// Helper for message bubble classes
const getMessageBubbleClasses = (from) =>
  `max-w-[90%] p-3 rounded-lg shadow-sm break-words text-sm ${
    from === "user"
      ? "bg-red-500 text-white rounded-br-none"
      : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
  }`;

// Custom CSS for hover-to-show resize handles
const resizeHandleStyles = `
  .custom-resize-handle {
    position: absolute;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 1000;
  }
  .react-resizable:hover .custom-resize-handle,
  .custom-resize-handle:hover {
    opacity: 1;
  }
  .custom-resize-handle-n, .custom-resize-handle-s {
    left: 50%;
    transform: translateX(-50%);
    height: 8px;
    width: 20px;
    cursor: ns-resize;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="8" viewBox="0 0 20 8"><path fill="%23999" d="M2 2H18M2 6H18" stroke="%23999" stroke-width="2"/></svg>') no-repeat center;
  }
  .custom-resize-handle-n { top: -2px; }
  .custom-resize-handle-s { bottom: -2px; }
  .custom-resize-handle-e, .custom-resize-handle-w {
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 20px;
    cursor: ew-resize;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="20" viewBox="0 0 8 20"><path fill="%23999" d="M2 2V18M6 2V18" stroke="%23999" stroke-width="2"/></svg>') no-repeat center;
  }
  .custom-resize-handle-e { right: -2px; }
  .custom-resize-handle-w { left: -2px; }
`;

export default function SearchAiModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Xin chào! Tôi là AI hỗ trợ khách hàng. Bạn cần tìm gì hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState({ width: 384, height: 600 });

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const widgetRef = useRef(null);
  const draggableRef = useRef(null);

  // Combined useEffect for scroll and click-outside
  useEffect(() => {
    if (!isOpen) return;

    // Scroll to latest message
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Click-outside handler
    const handleClickOutside = (e) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(e.target) &&
        !e.target.closest(".react-resizable-handle") &&
        !e.target.closest(".drag-handle")
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, messages]);

  // File preview handler
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, [file]);

  // Debounced resize handler
  const handleResize = debounce((e, { size }) => {
    e.stopPropagation();
    setSize({ width: size.width, height: size.height });
  }, 10);

  const sendMessage = async () => {
    if (loading || (!input.trim() && !file)) return;

    const userMsg = {
      from: "user",
      text: input || (file ? "Đã gửi hình ảnh" : ""),
      image: filePreview,
    };

    if (userMsg.text || userMsg.image) {
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setLoading(true);

      const formData = new FormData();
      if (input.trim()) formData.append("keyword", input.trim());
      if (file) formData.append("roomImage", file);

      try {
        const res = await fetch("http://localhost:3000/api/v1/searchAi", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            `API error: ${res.status} ${res.statusText}${
              errorData.message ? ` - ${errorData.message}` : ""
            }`
          );
        }

        const { reply, suggestions, additionalReply } = await res.json();
        const aiMessage = { from: "ai" };

        aiMessage.text =
          reply ||
          (suggestions?.length
            ? additionalReply || "Dưới đây là các sản phẩm đề xuất cho bạn:"
            : "AI phản hồi không đúng định dạng hoặc không tìm thấy gợi ý nào. 😕");
        if (suggestions?.length) {
          if (reply && additionalReply)
            aiMessage.text += `\n\n${additionalReply}`;
          aiMessage.suggestions = suggestions;
        }

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            from: "ai",
            text: `Đã xảy ra lỗi: ${
              err.message || "Không thể kết nối đến server 😢"
            }`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0] || null);

  const openFileSelector = () => !loading && fileInputRef.current?.click();

  const handleDragStart = (e) => e.stopPropagation();

  const isSendDisabled = loading || (!input.trim() && !file);

  return (
    <Draggable
      handle=".drag-handle"
      nodeRef={draggableRef}
      disabled={!isOpen}
      onStart={handleDragStart}
    >
      <div ref={draggableRef}>
        {isOpen ? (
          <ResizableBox
            width={size.width}
            height={size.height}
            minConstraints={[300, 400]}
            maxConstraints={[800, 800]}
            onResize={handleResize}
            resizeHandles={["n", "e", "s", "w"]}
            className="fixed bottom-4 right-4 z-50 shadow-lg rounded-md bg-white overflow-hidden transition-all duration-300"
            handle={(h, ref) => (
              <span
                className={`custom-resize-handle custom-resize-handle-${h} react-resizable-handle react-resizable-handle-${h}`}
                ref={ref}
                style={{
                  ...(h === "n" && {
                    top: "-2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }),
                  ...(h === "s" && {
                    bottom: "-2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }),
                  ...(h === "e" && {
                    right: "-2px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }),
                  ...(h === "w" && {
                    left: "-2px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }),
                }}
              />
            )}
          >
            <style>{resizeHandleStyles}</style>
            <div
              ref={widgetRef}
              className="flex flex-col h-full"
              style={{ width: "100%", height: "100%" }}
            >
              {/* Header */}
              <div className="drag-handle flex justify-between items-center p-4 bg-gradient-to-r from-red-500 to-indigo-600 text-white rounded-t-md cursor-move">
                <h3 className="text-base font-semibold">AI Hỗ Trợ</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-sm btn-circle bg-white/20 hover:bg-white/30 border-none"
                  aria-label="Đóng chatbot"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i}>
                    <div
                      className={`flex ${
                        msg.from === "user" ? "justify-end" : "justify-start"
                      } items-start`}
                    >
                      <div className={getMessageBubbleClasses(msg.from)}>
                        {msg.text?.split("\n").map((line, j) => (
                          <React.Fragment key={j}>
                            {line}
                            {j < msg.text.split("\n").length - 1 && <br />}
                          </React.Fragment>
                        ))}
                        {msg.from === "user" && msg.image && (
                          <img
                            src={msg.image}
                            alt="Hình ảnh đã gửi"
                            className="mt-2 w-24 h-24 object-cover rounded-md block"
                          />
                        )}
                      </div>
                    </div>
                    {msg.suggestions && msg.from === "ai" && (
                      <div className="mt-3 space-y-2">
                        {msg.suggestions.map((suggestion, j) => (
                          <SuggestionCard key={j} suggestion={suggestion} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                      <span className="loading loading-dots loading-sm text-gray-500" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-gray-200 flex flex-col gap-2 rounded-b-md">
                {filePreview && (
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-300 shadow-sm">
                    <img
                      src={filePreview}
                      alt="Xem trước ảnh"
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-600"
                      aria-label="Xóa ảnh"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  <textarea
                    className="textarea textarea-bordered w-full bg-gray-100 border-gray-300 focus:border-red-500 focus:ring focus:ring-red-200 rounded-lg min-h-[40px] max-h-[80px] resize-y text-sm p-2"
                    placeholder={
                      loading ? "Đang phản hồi..." : "Nhập câu hỏi..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    rows={1}
                  />
                  <button
                    className="btn btn-square btn-sm bg-red-500 hover:bg-red-600 text-white rounded-lg border-none"
                    onClick={sendMessage}
                    disabled={isSendDisabled}
                    aria-label="Gửi tin nhắn"
                  >
                    <SendHorizonal size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openFileSelector}
                    className="btn btn-sm rounded-full bg-gray-200 hover:bg-gray-300 border-none text-gray-600"
                    aria-label="Chọn ảnh"
                    disabled={loading}
                  >
                    <Plus size={16} />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  {file ? (
                    <span className="text-xs text-gray-500 truncate">
                      {file.name}
                    </span>
                  ) : (
                    !loading && (
                      <span className="text-xs text-gray-500">
                        Chọn ảnh (tùy chọn)
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </ResizableBox>
        ) : (
          <div
            ref={widgetRef}
            className="fixed bottom-4 right-4 z-50 p-2 w-30 h-16 flex items-center justify-center cursor-pointer bg-gradient-to-r from-red-500 to-indigo-600 text-white hover:from-red-600 hover:to-indigo-700 hover:scale-105 rounded-md"
            onClick={() => setIsOpen(true)}
            title="Bạn cần tư vấn, hãy hỏi ngay <3"
          >
            <div className="flex flex-row gap-2 items-center justify-center w-full h-full">
              <Bot size={28} />
              <h1 className="text-sm text-center font-semibold mt-1">
                Chatbot CSKH
              </h1>
            </div>
          </div>
        )}
      </div>
    </Draggable>
  );
}
