import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSkills() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const skillsQuery = useQuery({
    queryKey: [api.skills.list.path],
    queryFn: async () => {
      const res = await fetch(api.skills.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch skills");
      return api.skills.list.responses[200].parse(await res.json());
    },
  });

  const unlockSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      const url = buildUrl(api.skills.unlock.path, { id: skillId });
      const res = await fetch(url, {
        method: api.skills.unlock.method,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Cannot unlock skill");
        }
        throw new Error("Failed to unlock skill");
      }
      return api.skills.unlock.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.skills.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.profile.get.path] }); // Might affect stats/level
      toast({
        title: "NEURAL LINK ESTABLISHED",
        description: "New skill acquired. Protocol accepted.",
        className: "border-accent text-accent font-mono",
      });
    },
    onError: (err) => {
      toast({
        title: "ACCESS DENIED",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return {
    skills: skillsQuery.data ?? [],
    isLoading: skillsQuery.isLoading,
    unlockSkill: unlockSkillMutation.mutate,
    isUnlocking: unlockSkillMutation.isPending,
  };
}
