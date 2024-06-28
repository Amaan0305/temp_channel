import { useState, useEffect } from 'react';

export default function EditChannelSetupComponent({ channelNames, onSubmit }) {
  const [selectedChannel, setSelectedChannel] = useState('');
  const [channelData, setChannelData] = useState({
    channelName: '',
    divSelector: '',
    loginByPass: '',
    data: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChannelData = async () => {
      if (selectedChannel) {
        setLoading(true);
        setError('');
        try {
          const response = await fetch(`/api/socialmedia/${selectedChannel}`);
          if (response.ok) {
            const data = await response.json();
            setChannelData({
              channelName: data.channelName,
              divSelector: data.divSelector,
              loginByPass: data.loginByPass || '',
              data: data.data || []
            });
          } else {
            setError('Failed to fetch channel data');
          }
        } catch (error) {
          setError('Error fetching channel data:', error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchChannelData();
  }, [selectedChannel]);

  const handleChangeChannel = (e) => {
    setSelectedChannel(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      channelName: channelData.channelName,
      divSelector: channelData.divSelector,
      loginByPass: channelData.loginByPass
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-8 bg-white shadow-md rounded-lg">
      <div className="mb-6">
        <label htmlFor="selectChannel" className="block text-sm font-medium text-gray-700">Select Channel</label>
        <select
          id="selectChannel"
          value={selectedChannel}
          onChange={handleChangeChannel}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
          required
        >
          <option value="">Select a Channel</option>
          {channelNames.map(channelName => (
            <option key={channelName} value={channelName}>{channelName.charAt(0).toUpperCase() + channelName.slice(1)}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-center text-blue-500">Loading...</div>
      ) : (
        <>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="mb-6">
            <label htmlFor="editDivSelector" className="block text-sm font-medium text-gray-700">Div Selector</label>
            <input
              type="text"
              id="editDivSelector"
              value={channelData.divSelector}
              onChange={(e) => setChannelData({ ...channelData, divSelector: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="editLoginByPass" className="block text-sm font-medium text-gray-700">Login ByPass</label>
            <textarea
              id="editLoginByPass"
              value={channelData.loginByPass}
              onChange={(e) => setChannelData({ ...channelData, loginByPass: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300 h-40 resize-none"
            />
          </div>
          {channelData.data.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Links</label>
              <ul className="list-disc pl-5 space-y-2">
                {channelData.data.map((link, index) => (
                  <li key={index}>
                    <p className="text-sm text-gray-800"><strong>Scenario:</strong> {link.scenario}</p>
                    <p className="text-sm text-gray-800"><strong>URL:</strong> {link.url}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
            Save Changes
          </button>
        </>
      )}
    </form>
  );
}
