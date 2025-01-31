import { useState } from 'react';

export default function SocialMediaFormComponent({ onSubmit }) {
  const [channelName, setChannelName] = useState('');
  const [divSelector, setDivSelector] = useState('');
  const [loginByPass, setLoginByPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = {
      channelName,
      divSelector,
      data: [],
      loginByPass
    };

    try {
      await onSubmit(formData);
      setChannelName('');
      setDivSelector('');
      setLoginByPass('');
      setSuccess('Form submitted successfully');
    } catch (err) {
      setError('Error submitting form: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-8 bg-white shadow-md rounded-lg">
      <div className="mb-6">
        <label htmlFor="channelName" className="block text-sm font-medium text-gray-700">Channel Name</label>
        <input
          type="text"
          id="channelName"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="divSelector" className="block text-sm font-medium text-gray-700">Div Selector</label>
        <input
          type="text"
          id="divSelector"
          value={divSelector}
          onChange={(e) => setDivSelector(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="loginByPass" className="block text-sm font-medium text-gray-700">Login ByPass</label>
        <textarea
          id="loginByPass"
          value={loginByPass}
          onChange={(e) => setLoginByPass(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300 h-40 resize-none"
        />
      </div>
      {loading && <div className="text-blue-500 mb-4">Submitting...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}
      <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
        Submit
      </button>
    </form>
  );
}
