"use client";
import CharacterPanel from "../CharacterPanel";

interface Props {
  projectId: string;
}

export default function CharactersTab({ projectId }: Props) {
  return <CharacterPanel projectId={projectId} />;
}
