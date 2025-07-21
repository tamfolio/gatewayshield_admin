import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import CreateNewsArticle from "./CreateNews";
import ViewAllNews from "./ViewAllNews";

function News() {
  const [activeTab, setActiveTab] = useState("Create News");
  return (
    <div className="flex-1 bg-white p-6">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <span>Dashboard</span>
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
          <span>Admin Tools</span>
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
          <span className="text-gray-900">News</span>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === "Create News"
                ? "bg-gray-100 text-gray-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("Create News")}
          >
            Create News Article
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === "View All"
                ? "bg-gray-100 text-gray-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("View All")}
          >
            View All News
          </button>
        </div>
      </div>
      <div className="">
        {activeTab === "Create News" && <CreateNewsArticle />}
        {activeTab === "View All" && <ViewAllNews/>}
      </div>
    </div>
  );
}

export default News;
