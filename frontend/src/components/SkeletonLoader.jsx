import React from 'react';

export const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  const renderCardSkeleton = () => (
    <div className="animate-pulse rounded-2xl bg-slate-800/50 p-4 border border-slate-700/30">
      <div className="h-40 w-full rounded-xl bg-slate-700"></div>
      <div className="mt-4 h-6 w-3/4 rounded bg-slate-700"></div>
      <div className="mt-2 h-4 w-1/2 rounded bg-slate-700"></div>
      <div className="mt-4 flex justify-between">
        <div className="h-8 w-20 rounded bg-slate-700"></div>
        <div className="h-8 w-16 rounded bg-slate-700"></div>
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <tr className="animate-pulse border-b border-slate-700/30">
      <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-slate-700"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-48 rounded bg-slate-700"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-700"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-700"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-slate-700"></div></td>
      <td className="px-6 py-4"><div className="h-6 w-24 rounded bg-slate-700"></div></td>
    </tr>
  );

  const renderDetailSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="h-64 w-full rounded-2xl bg-slate-800"></div>
      <div className="h-10 w-2/3 rounded bg-slate-800"></div>
      <div className="h-6 w-1/3 rounded bg-slate-800"></div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-slate-800"></div>
        <div className="h-4 w-full rounded bg-slate-800"></div>
        <div className="h-4 w-5/6 rounded bg-slate-800"></div>
      </div>
    </div>
  );

  const renderStatsSkeleton = () => (
    <div className="animate-pulse rounded-2xl bg-slate-800/50 p-6 border border-slate-700/30">
      <div className="h-4 w-1/3 rounded bg-slate-700"></div>
      <div className="mt-2 h-8 w-2/3 rounded bg-slate-700"></div>
    </div>
  );

  return (
    <>
      {type === 'card' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count }).map((_, idx) => (
            <React.Fragment key={idx}>{renderCardSkeleton()}</React.Fragment>
          ))}
        </div>
      )}
      {type === 'table' && (
        <tbody className="divide-y divide-slate-700/30">
          {Array.from({ length: count }).map((_, idx) => (
            <React.Fragment key={idx}>{renderTableSkeleton()}</React.Fragment>
          ))}
        </tbody>
      )}
      {type === 'detail' && renderDetailSkeleton()}
      {type === 'stats' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: count }).map((_, idx) => (
            <React.Fragment key={idx}>{renderStatsSkeleton()}</React.Fragment>
          ))}
        </div>
      )}
    </>
  );
};

export default SkeletonLoader;
