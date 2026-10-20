import { useMutation } from "@tanstack/react-query";
import { contactService } from "@/services/contact.service";

export function useSendContactMessage() {
  return useMutation({ mutationFn: contactService.sendMessage });
}
