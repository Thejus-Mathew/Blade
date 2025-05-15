import { getMembersAction } from "@/app/actions/member-actions"
import MembersDisplay from "@/components/members-display"
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await getMembersAction()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Members</h1>
      <MembersDisplay initialMembers={members} />
    </div>
  )
}
