import { useEffect, useState } from 'react';
import axios from 'axios';

interface Candidate {
  id: number;
  name: string;
  skills: string[];
}

export default function CandidateList() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios.get(import.meta.env.VITE_API_BASE_URL + '/api/candidates')
      .then(res => setCandidates(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <ul className="space-y-2">
      {candidates.map(c => (
        <li key={c.id} className="p-4 bg-white shadow rounded">
          <p className="font-semibold">{c.name}</p>
          <p className="text-sm text-gray-600">{c.skills.join(', ')}</p>
        </li>
      ))}
    </ul>
  );
}
