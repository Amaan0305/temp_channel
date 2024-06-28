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
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchChannelData = async () => {
      if (selectedChannel) {
        setLoading(true);
        setError('');
        try {
          const response = await fetch(`http://localhost:4001/fetch-channel/${selectedChannel}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
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
          setError('Error fetching channel data: ' + error.message);
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

  const handleLinkChange = (index, field, value) => {
    const newData = [...channelData.data];
    newData[index][field] = value;
    setChannelData({ ...channelData, data: newData });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      channelName: channelData.channelName,
      divSelector: channelData.divSelector,
      loginByPass: channelData.loginByPass,
      data: channelData.data
    };

    try {
      const response = await fetch(`/api/socialmedia/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Changes saved successfully');
        // Reset form data
        setSelectedChannel('');
        setChannelData({
          channelName: '',
          divSelector: '',
          loginByPass: '',
          data: []
        });
        // Clear the message after 3 seconds
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setError('Error updating channel data');
      }
    } catch (error) {
      setError('Error updating channel data: ' + error.message);
    }
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
      {selectedChannel && (
        <>
          {loading ? (
            <div className="text-center text-blue-500">Loading...</div>
          ) : (
            <>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              {message && <div className="text-green-500 mb-4">{message}</div>}
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
                  <ul className="space-y-4">
                    {channelData.data.map((link, index) => (
                      <li key={index} className="flex flex-col space-y-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Scenario</label>
                          <input
                            type="text"
                            value={link.scenario}
                            onChange={(e) => handleLinkChange(index, 'scenario', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">URL</label>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-300"
                          />
                        </div>
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
        </>
      )}
    </form>
  );
}
