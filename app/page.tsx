import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Link href="/register">
        <button
          className="rounded-md bg-blue-500 text-white py-2 font-medium shadow-md hover:bg-blue-600"
          style={{ width: "150px", height: "70px" }}>
          Start Now
        </button>
      </Link>
    </main>
  );
}
