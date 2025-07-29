import React from 'react';

// Generic skeleton loader
export const SkeletonLoader = ({ className = "", children }) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
);

// Table skeleton for SLA Settings
export const TableSkeleton = ({ rows = 5, columns = 3 }) => (
  <SkeletonLoader>
    <div className="space-y-4">
      {/* Header */}
      <div className={`grid grid-cols-${columns} gap-4`}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={`grid grid-cols-${columns} gap-4`}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  </SkeletonLoader>
);

// List skeleton for Closure Reasons
export const ListSkeleton = ({ items = 4 }) => (
  <SkeletonLoader>
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center py-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  </SkeletonLoader>
);

// Table with pagination skeleton for Manage Incident Type
export const DataTableSkeleton = ({ rows = 10 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    {/* Header skeleton */}
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <SkeletonLoader>
        <div className="h-6 bg-gray-200 rounded w-48"></div>
      </SkeletonLoader>
      <div className="flex items-center space-x-4">
        <SkeletonLoader>
          <div className="h-10 bg-gray-200 rounded w-64"></div>
        </SkeletonLoader>
        <SkeletonLoader>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </SkeletonLoader>
        <SkeletonLoader>
          <div className="h-10 bg-gray-200 rounded w-40"></div>
        </SkeletonLoader>
      </div>
    </div>

    {/* Table skeleton */}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3">
              <SkeletonLoader>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </SkeletonLoader>
            </th>
            <th className="px-6 py-3">
              <SkeletonLoader>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </SkeletonLoader>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index}>
              <td className="px-6 py-4">
                <SkeletonLoader>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </SkeletonLoader>
              </td>
              <td className="px-6 py-4 text-right">
                <SkeletonLoader>
                  <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                </SkeletonLoader>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Pagination skeleton */}
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      <SkeletonLoader>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </SkeletonLoader>
      
      <div className="flex space-x-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <SkeletonLoader key={index}>
            <div className="h-10 w-10 bg-gray-200 rounded"></div>
          </SkeletonLoader>
        ))}
      </div>
      
      <SkeletonLoader>
        <div className="h-10 bg-gray-200 rounded w-20"></div>
      </SkeletonLoader>
    </div>
  </div>
);

// Loading skeleton for forms
export const FormSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <SkeletonLoader>
      <div className="space-y-6">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
        <TableSkeleton rows={7} columns={3} />
        <div className="flex justify-end space-x-3">
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
    </SkeletonLoader>
  </div>
);

export default {
  SkeletonLoader,
  TableSkeleton,
  ListSkeleton,
  DataTableSkeleton,
  FormSkeleton
};