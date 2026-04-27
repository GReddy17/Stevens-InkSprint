import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ContestForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    prompt: initialData.prompt || '',
    rules: initialData.rules || '',
    startTime: initialData.startTime ? new Date(initialData.startTime) : null,
    endTime: initialData.endTime ? new Date(initialData.endTime) : null,
    votingType: initialData.votingType || 'EVERYONE',
    wordMin: initialData.wordMin ?? '',
    wordMax: initialData.wordMax ?? '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : value, // keep as string for select
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    

    const payload = {
      ...formData,
      wordMin: min,
      wordMax: max,
      startTime: formData.startTime?.toISOString(),
      endTime: formData.endTime?.toISOString(),
    };

    if (onSubmit) {
      onSubmit(payload);
    } else {
      console.log('Form submitted:', payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
      {/* Title */}
      <div>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      {/* Prompt */}
      <div>
        <label>Prompt</label>
        <input
          type="text"
          name="prompt"
          value={formData.prompt}
          onChange={handleChange}
          required
        />
      </div>

      {/* Rules */}
      <div>
        <label>Rules</label>
        <textarea
          name="rules"
          value={formData.rules}
          onChange={handleChange}
        />
      </div>

      {/* Start Time */}
      <div>
        <label>Start Time</label>
        <DatePicker
          selected={formData.startTime}
          onChange={(date) =>
            setFormData((prev) => ({ ...prev, startTime: date }))
          }
          showTimeSelect
          dateFormat="Pp"
          placeholderText="Select start time"
        />
      </div>

      {/* End Time */}
      <div>
        <label>End Time</label>
        <DatePicker
          selected={formData.endTime}
          onChange={(date) =>
            setFormData((prev) => ({ ...prev, endTime: date }))
          }
          showTimeSelect
          dateFormat="Pp"
          placeholderText="Select end time"
          minDate={formData.startTime}
        />
      </div>

      {/* Voting Type */}
      <div>
        <label>Voting Type</label>
        <select
          name="votingType"
          value={formData.votingType}
          onChange={handleChange}
        >
          <option value="EVERYONE">Everyone</option>
          <option value="JUDGES">Judges</option>
          <option value="CREATOR">Creator</option>
          <option value="GROUP">Group</option>
        </select>
      </div>

      {/* Word Min */}
      <div>
        <label>Word Min</label>
        <select
          name="wordMin"
          value={formData.wordMin}
          onChange={handleChange}
        >
          <option value="">None</option>
          {[100, 250, 500, 1000].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Word Max */}
      <div>
        <label>Word Max</label>
        <select
          name="wordMax"
          value={formData.wordMax}
          onChange={handleChange}
        >
          <option value="">None</option>
          {[500, 1000, 2000, 5000].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <button type="submit">Submit</button>
    </form>
  );
};

export default ContestForm;