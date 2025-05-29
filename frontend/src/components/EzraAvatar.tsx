import Image from 'next/image';

export default function EzraAvatar() {
  return (
    <div className="flex justify-center items-center bg-purple-800 rounded-full p-3 mt-6">
      <Image
        src="/ezra-avatar.png"
        alt="Ezra"
        width={120}
        height={120}
        className="rounded-full"
      />
    </div>
  );
}
