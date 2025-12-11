import { useState } from 'react';
import { X } from 'lucide-react';
import { Influencer } from '../types/models';
import { Input } from './ui/input';

interface InfluencerMultiSelectProps {
  influencers: Influencer[];
  selected: string[];
  onSelectionChange: (influencerIds: string[]) => void;
  loading?: boolean;
}

export default function InfluencerMultiSelect({
  influencers,
  selected,
  onSelectionChange,
  loading = false,
}: InfluencerMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = influencers.filter(
    (influencer) =>
      influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      influencer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedInfluencers = influencers.filter((i) =>
    selected.includes(i.id)
  );

  const toggleInfluencer = (influencerId: string) => {
    if (selected.includes(influencerId)) {
      onSelectionChange(selected.filter((id) => id !== influencerId));
    } else {
      onSelectionChange([...selected, influencerId]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          placeholder="Search influencers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          disabled={loading}
          className="pr-10"
        />
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-slate-500">
                No influencers found
              </div>
            ) : (
              filtered.map((influencer) => (
                <button
                  key={influencer.id}
                  onClick={() => {
                    toggleInfluencer(influencer.id);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(influencer.id)}
                    onChange={() => {}}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">
                      {influencer.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {influencer.email}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {selectedInfluencers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedInfluencers.map((influencer) => (
            <div
              key={influencer.id}
              className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700"
            >
              <span>{influencer.name}</span>
              <button
                onClick={() => toggleInfluencer(influencer.id)}
                className="hover:text-slate-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="text-sm text-slate-600 hover:text-slate-900 text-left"
        >
          {selected.length === 0
            ? 'Select influencers'
            : `${selected.length} influencer(s) selected`}
        </button>
      )}
    </div>
  );
}
