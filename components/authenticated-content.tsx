import { FriendsList } from "@/components/widgets/friends-list"
import { InventoryDisplay } from "@/components/widgets/inventory-display"
import { PaymentInterface } from "@/components/widgets/payment-interface"

export function AuthenticatedContent() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <InventoryDisplay />
      <PaymentInterface />
      <FriendsList />
    </div>
  )
}
