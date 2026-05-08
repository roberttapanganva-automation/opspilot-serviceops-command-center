import { z } from "zod";

export const acceptInvitationSchema = z.object({
  invitationId: z.uuid(),
});
