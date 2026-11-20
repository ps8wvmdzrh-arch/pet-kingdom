import SwiftUI

@main
struct PetKingdomApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .statusBarHidden(true)
                .ignoresSafeArea(.all)
                .preferredColorScheme(.dark)
        }
    }
}
