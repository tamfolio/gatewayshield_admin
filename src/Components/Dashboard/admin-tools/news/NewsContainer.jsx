import React, { useState } from 'react';
import ViewAllNews from './ViewAllNews';
import CreateNewsForm from './CreateNewsForm';
import { ChevronRight } from 'lucide-react';

const NewsContainer = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [editingNewsId, setEditingNewsId] = useState(null);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ChevronRight className="w-4 h-4" />
        <span>Admin Tools</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">News</span>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Create News Article
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'view' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          View All News
        </button>
      </div>

      {activeTab === 'create' ? (
        <CreateNewsForm editingNewsId={editingNewsId} setEditingNewsId={setEditingNewsId} />
      ) : (
        <ViewAllNews
          onEditNews={(id) => {
            setEditingNewsId(id);
            setActiveTab('create');
          }}
          onSwitchToCreate={() => setActiveTab('create')}
        />
      )}
    </div>
  );
};

export default NewsContainer;
