import React, { useEffect } from 'react';
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter } from 'lucide-react';

const RichTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = '', 
  minHeight = '120px',
  showHeadings = false,
  error,
  limit = 1000,
  textRef
}) => {
  // Safe value handling
  const safeValue = value || '';
  const safeLimit = limit || 1000;

  const formatText = (command, commandValue = null) => {
    if (!textRef?.current) return;
    
    document.execCommand(command, false, commandValue);
    // Trigger onChange after formatting
    handleContentChange();
  };

  const getTextContent = (element) => {
    if (!element) return '';
    return element.textContent || element.innerText || '';
  };

  const handleContentChange = () => {
    if (!textRef?.current || !onChange) return;
    
    const htmlContent = textRef.current.innerHTML;
    const textContent = getTextContent(textRef.current);
    
    // Check character limit
    if (textContent.length <= safeLimit) {
      onChange(htmlContent); // Pass HTML content, not text
    } else {
      // If over limit, prevent the change by restoring previous content
      textRef.current.innerHTML = safeValue;
    }
  };

  // Set initial content
  useEffect(() => {
    if (textRef?.current && safeValue !== undefined) {
      // Only update if the content is different to avoid cursor jumping
      if (textRef.current.innerHTML !== safeValue) {
        textRef.current.innerHTML = safeValue;
      }
    }
  }, [safeValue]);

  // Handle paste events to ensure character limit
  const handlePaste = (e) => {
    if (!textRef?.current) return;
    
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    const currentText = getTextContent(textRef.current);
    
    if (currentText.length + paste.length <= safeLimit) {
      document.execCommand('insertText', false, paste);
      handleContentChange();
    }
  };

  return (
    <div>
      {/* Rich Text Toolbar */}
      <div className="flex items-center gap-1 p-2 border border-gray-300 rounded-t-md bg-gray-50">
        {showHeadings && (
          <select 
            className="text-sm border-none bg-transparent focus:outline-none mr-2"
            onChange={(e) => formatText('formatBlock', e.target.value)}
          >
            <option value="div">Normal</option>
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="p">P</option>
          </select>
        )}
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-1 rounded hover:bg-gray-200"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-1 rounded hover:bg-gray-200"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="p-1 rounded hover:bg-gray-200"
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-2"></div>
        <button
          type="button"
          onClick={() => formatText('justifyLeft')}
          className="p-1 rounded hover:bg-gray-200"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('justifyCenter')}
          className="p-1 rounded hover:bg-gray-200"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="p-1 rounded hover:bg-gray-200"
        >
          <List className="w-4 h-4" />
        </button>
      </div>
      
      {/* Content Editable Area */}
      <div
        ref={textRef}
        contentEditable
        className={`p-3 border border-t-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        style={{ minHeight }}
        onInput={handleContentChange}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      
      {/* Character Count */}
      <div className="flex justify-between items-center mt-1">
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <span>{error}</span>
          </div>
        )}
        <div className="text-sm text-gray-500 ml-auto">
          {textRef?.current ? getTextContent(textRef.current).length : 0}/{safeLimit}
        </div>
      </div>
      
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          cursor: text;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;