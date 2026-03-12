"use client";

import Alert from "@/components/alert";
import { Heading2 } from "@breadcoop/ui";
import StackMember from "./member";
import BackMeta from "./back-meta";
import { useStackSupabase } from "@/hooks/use-stack-supabase";

const StackHeader = ({
  id,
  isMember,
}: {
  id: string;
  isMember: boolean | undefined;
}) => {
  // const [localCircles, setLocalCircles] = useState<LocalStorageCircles>({});

  // useEffect(() => {
  //   setLocalCircles(JSON.parse(localStorage.getItem("circles") || "{}"));
  // }, []);

  const { data: stackMetadata } = useStackSupabase(id, !!isMember);

  const stackName = isMember
    ? (stackMetadata?.stackname ?? `Stack ${id}`)
    : `Stack ${id}`;

  return (
    <header className="mb-3.5 md:mb-6">
      <div className="flex flex-col flex-wrap gap-4 mb-5.25 sm:flex-row sm:items-center sm:justify-between md:mb-7.25">
        <Heading2 className="text-primary-blue text-2xl md:text-5xl">
          {stackName}
        </Heading2>
        <StackMember isMember={isMember} />
      </div>
      <BackMeta className="hidden md:flex md:mt-2 md:mb-6" />
      <Alert
        closeAble={false}
        variant="warning"
        title="IMPORTANT: Missing a deposit retires your Stacks group"
        description="If any member misses a deposit the Stacks discontinues and
					all funds deposited in that round are returned back to other
					members"
      />
    </header>
  );
};

export default StackHeader;
