import React from 'react';
import { ExternalLink, Trash2, Share2, Clock, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ContentCard = ({ content, onDelete, onShare }) => {
  const categoryColors = {
    fitness: 'badge-fitness',
    coding: 'badge-coding',
    food: 'badge-food',
    travel: 'badge-travel',
    design: 'badge-design',
    fashion: 'badge-fashion',
    business: 'badge-business',
    education: 'badge-education',
    entertainment: 'badge-entertainment',
    other: 'badge-other'
  };

  const platformIcons = {
    instagram: '📷',
    twitter: '🐦',
    blog: '📝',
    youtube: '📺',
    other: '🔗'
  };

  const handleOpenLink = () => {
    window.open(content.url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare(content);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="card group cursor-pointer animate-fade-in" onClick={handleOpenLink}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{platformIcons[content.platform] || platformIcons.other}</span>
          <span className={`badge ${categoryColors[content.category] || categoryColors.other}`}>
            {content.category}
          </span>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleShare}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Thumbnail */}
      {content.thumbnail_url && (
        <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        {content.title && (
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
            {content.title}
          </h3>
        )}

        {/* AI Summary */}
        {content.ai_summary && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {content.ai_summary}
          </p>
        )}

        {/* Description */}
        {content.description && content.description !== content.ai_summary && (
          <p className="text-sm text-gray-500 line-clamp-2">
            {content.description}
          </p>
        )}

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {content.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {content.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{content.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700">
            <ExternalLink className="w-3 h-3" />
            <span>Open</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
