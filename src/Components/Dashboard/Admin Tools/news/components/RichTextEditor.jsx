import React from 'react';
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter } from 'lucide-react';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder, 
  minHeight = '120px',
  showHeadings = false,
  error,
  limit,
  textRef
}) => {
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const getTextContent = (element) => {
    if (!element) return '';
    return element.textContent || element.innerText || '';
  };

  const handleContentChange = () => {
    const textContent = getTextContent(textRef.current);
    if (textContent.length <= limit) {
      onChange(textContent);
    }
  };

  return (
    <div>
      {/* Rich Text Toolbar */}
      <div className="flex items-center gap-1 p-2 border border-gray-300 rounded-t-md bg-gray-50">
        {showHeadings && (
          <select className="text-sm border-none bg-transparent focus:outline-none mr-2">
            <option>H1</option>
            <option>H2</option>
            <option>H3</option>
            <option>P</option>
          </select>
        )}
        <button
          onClick={() => formatText('bold')}
          className="p-1 rounded hover:bg-gray-200"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('italic')}
          className="p-1 rounded hover:bg-gray-200"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('underline')}
          className="p-1 rounded hover:bg-gray-200"
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-4 h-4 bg-black rounded-full mx-2"></div>
        <button
          onClick={() => formatText('justifyLeft')}
          className="p-1 rounded hover:bg-gray-200"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => formatText('justifyCenter')}
          className="p-1 rounded hover:bg-gray-200"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
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
          {textRef.current ? getTextContent(textRef.current).length : 0}/{limit}
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;