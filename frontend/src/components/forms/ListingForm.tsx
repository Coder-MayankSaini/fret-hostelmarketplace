import React, { useState } from 'react';

const ListingForm: React.FC = () => {
  const [title, setTitle] = useState('');
  
  return (
    <div>
      <h1>Listing Form</h1>
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
    </div>
  );
};

export default ListingForm; 