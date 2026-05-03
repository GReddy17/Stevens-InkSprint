import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import JudgePicker from './JudgePicker'

const ContestForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    prompt: initialData.prompt || '',
    rules: initialData.rules || '',
    startTime: initialData.startTime ? new Date(initialData.startTime) : null,
    endTime: initialData.endTime ? new Date(initialData.endTime) : null,
    votingType: initialData.votingType || 'EVERYONE',
    currentJudges: initialData.votingGroupMembers || [],
    votingGroupMemberIds: initialData.votingGroupMemberIds || [],
    wordMin: initialData.wordMin ?? '',
    wordMax: initialData.wordMax ?? '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (
      formData.startTime &&
      formData.endTime &&
      formData.endTime < formData.startTime
    ) {
      alert('End time must be after start time')
      return
    }

    const min = formData.wordMin !== '' ? Number(formData.wordMin) : null
    const max = formData.wordMax !== '' ? Number(formData.wordMax) : null

    if (min !== null && max !== null && min > max) {
      alert('Min words cannot exceed max words')
      return
    }

    if (
      formData.votingType === 'JUDGES' &&
      formData.currentJudges.length === 0
    ) {
      alert('Please select at least one judge')
      return
    }

    const payload = {
      ...formData,
      votingGroupMemberIds: formData.currentJudges.map((j) => j.id),
      wordMin: min,
      wordMax: max,
      startTime: formData.startTime?.toISOString(),
      endTime: formData.endTime?.toISOString(),
    }

    onSubmit?.(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block mb-2 font-medium">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="e.g. Horror Story Challenge"
          required
        />
      </div>

      {/* Prompt */}
      <div>
        <label className="block mb-2 font-medium">Prompt</label>
        <textarea
          name="prompt"
          value={formData.prompt}
          onChange={handleChange}
          className="w-full min-h-32 rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="Describe the writing prompt..."
          required
        />
      </div>

      {/* Rules */}
      <div>
        <label className="block mb-2 font-medium">
          Rules <span className="text-gray-500 text-sm">(optional)</span>
        </label>
        <textarea
          name="rules"
          value={formData.rules}
          onChange={handleChange}
          className="w-full min-h-24 rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="Original work only, etc."
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-medium">Start Time</label>
          <DatePicker
            selected={formData.startTime}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, startTime: date }))
            }
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Select start time"
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">End Time</label>
          <DatePicker
            selected={formData.endTime}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, endTime: date }))
            }
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Select end time"
            minDate={formData.startTime}
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white"
          />
        </div>
      </div>

      {/* Voting */}
      <div>
        <label className="block mb-2 font-medium">Voting Type</label>
        <select
          name="votingType"
          value={formData.votingType}
          onChange={handleChange}
          className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white"
        >
          <option value="EVERYONE">Everyone</option>
          <option value="JUDGES">Judges</option>
          <option value="CREATOR">Creator</option>
        </select>
      </div>

      {formData.votingType === 'JUDGES' && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <JudgePicker
            currentJudges={formData.currentJudges}
            onChange={(judges) =>
              setFormData((prev) => ({
                ...prev,
                currentJudges: judges,
              }))
            }
          />
        </div>
      )}

      {/* Word limits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-medium">
            Min Words <span className="text-gray-500 text-sm">(optional)</span>
          </label>
          <input
            type="number"
            name="wordMin"
            value={formData.wordMin}
            onChange={handleChange}
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white"
            placeholder="No minimum"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Max Words <span className="text-gray-500 text-sm">(optional)</span>
          </label>
          <input
            type="number"
            name="wordMax"
            value={formData.wordMax}
            onChange={handleChange}
            className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white"
            placeholder="No maximum"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-white text-gray-900 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-200"
        >
          Create Contest
        </button>
      </div>
    </form>
  )
}

export default ContestForm