import Image from 'next/image';

export default function Home() {
  return (
    <div>
      <h1>Difference Images</h1>

      <Image
        src="/results/diff_9.png"
        alt="Image 10"
        width="500"
        height="300"
      />
    
    </div>
  );
}
