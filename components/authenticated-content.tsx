import { FriendsList } from "@/components/widgets/friends-list"
import { InventoryDisplay } from "@/components/widgets/inventory-display"
import { PaymentInterface } from "@/components/widgets/payment-interface"

export function AuthenticatedContent() {
  return (
    <>
      {/* 
        ═══════════════════════════════════════════════════════════════
        CUSTOMIZE YOUR AUTHENTICATED APP CONTENT HERE
        
        The components below are HandCash WIDGETS located in:
        components/widgets/
        
        You can:
        - Use these widgets as-is in your app
        - Copy and modify them for custom functionality
        - Remove any widgets you don't need
        - Reference them to learn how HandCash APIs work
        - Add your own custom components
        
        The HeaderBar (top menu with user profile) is separate and will
        remain intact at the top of the page.
        ═══════════════════════════════════════════════════════════════
      */}

      {/* Widget: Digital Items Inventory - Displays and transfers items */}
      <InventoryDisplay />

      {/* Widget: Payment Interface - Send BSV payments */}
      <PaymentInterface />

      {/* Widget: Friends List - Shows user's HandCash friends (requires Friends scope in HandCash app) */}
      <FriendsList />

      {/* 
        ═══════════════════════════════════════════════════════════════
        ADD YOUR CUSTOM COMPONENTS BELOW
        
        Replace or remove the widgets above with your own components:
        
        import { YourComponent } from "@/components/your-component"
        <YourComponent />
        
        The widgets in components/widgets/ are pre-built and ready to use.
        Copy and modify them as needed for your app.
        ═══════════════════════════════════════════════════════════════
      */}
    </>
  )
}
