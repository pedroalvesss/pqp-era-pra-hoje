import { logout } from "@/actions/authActions";
import { Avatar } from "@/components/shell/Avatar";
import { getProfile } from "@/services/perfisService/getProfile";
import { PrefsGroup } from "./_components/PrefsGroup";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <>
      <div className="flex items-center gap-3.5">
        <Avatar name={profile.name} size={56} />
        <div className="flex flex-col">
          <h1 className="m-0 text-2xl font-medium tracking-[-0.03em]">{profile.name.toLowerCase()}</h1>
          <span className="text-[13px] text-neutral-500">{profile.email}</span>
        </div>
      </div>
      <PrefsGroup pushEnabled={profile.pushEnabled} lead={profile.lead} workdayEnd={profile.workdayEnd} />
      <form action={logout}>
        <button type="submit" className="btn btn-ghost text-late text-[15px]">
          sair
        </button>
      </form>
    </>
  );
}
