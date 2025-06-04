import CandidateList from '../components/CandidateList';

export default function Home() {
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Academia Recruitment</h1>
      <CandidateList />
    </div>
  );
}
