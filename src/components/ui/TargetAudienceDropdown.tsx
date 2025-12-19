// src/components/ui/TargetAudienceDropdown.tsx
import React from 'react';

interface TargetAudienceDropdownProps {
  selectedAudience: string;
  onAudienceChange: (audience: string) => void;
}

const audiences = [
  { id: 'general', name: 'General' },
  { id: 'millennials', name: 'Millennials' },
  { id: 'gen-z', name: 'Gen Z' },
  { id: 'boomers', name: 'Boomers' },
];

const TargetAudienceDropdown: React.FC<TargetAudienceDropdownProps> = ({
  selectedAudience,
  onAudienceChange,
}) => {
  return (
    <div className="w-full">
      <label htmlFor="targetAudience" className="block text-sm font-medium text-textlight mb-1">
        Target Audience
      </label>
      <select
        id="targetAudience"
        name="targetAudience"
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
        value={selectedAudience}
        onChange={(e) => onAudienceChange(e.target.value)}
      >
        {audiences.map((audience) => (
          <option key={audience.id} value={audience.id}>
            {audience.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TargetAudienceDropdown;
