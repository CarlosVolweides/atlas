"use client";
import { useParams } from 'next/navigation';

export default function LeccionPage() {
  const params = useParams();
  return (
    <div>
      <h1>Leccion {params.leccionName}</h1>
    </div>
  )
}