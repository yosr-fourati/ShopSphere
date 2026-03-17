package com.AeiselDev.ShopSphere.Configs;

import com.AeiselDev.ShopSphere.entities.Category;
import com.AeiselDev.ShopSphere.entities.Item;
import com.AeiselDev.ShopSphere.entities.Role;
import com.AeiselDev.ShopSphere.entities.User;
import com.AeiselDev.ShopSphere.enums.RoleType;
import com.AeiselDev.ShopSphere.repositories.CategoryRepository;
import com.AeiselDev.ShopSphere.repositories.ItemRepository;
import com.AeiselDev.ShopSphere.repositories.RoleRepository;
import com.AeiselDev.ShopSphere.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {

        // ── Fix nullable constraint for guest orders (safe to run on every startup) ──
        fixGuestOrderConstraint();

        // ── Always ensure categories exist ───────────────────────
        seedCategories();

        // ── Always ensure roles exist ─────────────────────────────
        Role userRole   = getOrCreateRole(RoleType.USER);
        Role sellerRole = getOrCreateRole(RoleType.SELLER);
        Role adminRole  = getOrCreateRole(RoleType.ADMIN);

        // ── Always ensure admin account exists (upsert password on every restart) ──
        userRepository.findByEmail("admin@shopsphere.com").ifPresentOrElse(
            admin -> {
                admin.setPassword(passwordEncoder.encode("Sph3re@Adm!n#2025"));
                admin.setEnabled(true);
                admin.setAccountLocked(false);
                admin.setRole(adminRole);
                userRepository.save(admin);
            },
            () -> createUser("Admin", "ShopSphere", "admin@shopsphere.com", "Sph3re@Adm!n#2025", adminRole)
        );

        if (itemRepository.count() > 0) {
            log.info("Database already seeded — skipping demo data.");
            return;
        }

        log.info("Seeding database with demo data...");

        // ── Demo users ────────────────────────────────────────────
        User seller = createUser("Alex", "Carter", "seller@shopsphere.com", "Seller1234!", sellerRole);
        createUser("Sarah", "Johnson", "buyer@shopsphere.com", "Buyer1234!", userRole);

        // ── Items ────────────────────────────────────────────────
        Category electronics = getOrCreateCategory("Electronics",        "Gadgets, devices, and accessories");
        Category clothing    = getOrCreateCategory("Clothing",           "Fashion, apparel, and accessories");
        Category books       = getOrCreateCategory("Books",              "Books, guides, and literature");
        Category homeGarden  = getOrCreateCategory("Home & Garden",      "Home improvement and garden supplies");
        Category sports      = getOrCreateCategory("Sports",             "Sports, fitness, and outdoors");
        Category beauty      = getOrCreateCategory("Beauty",             "Skincare, haircare, and personal care");
        Category toys        = getOrCreateCategory("Toys",               "Toys and games for all ages");
        Category food        = getOrCreateCategory("Food",               "Snacks, pantry staples, and specialty foods");

        List<Item> items = List.of(

            // Electronics (5)
            item("Wireless Noise-Cancelling Headphones",
                "Premium over-ear headphones with 30-hour battery, active noise cancellation, and hi-fi audio. Foldable design with carrying case.",
                new BigDecimal("129.99"), 45, electronics, seller),

            item("4K Webcam Pro",
                "Ultra-HD 4K webcam with auto-focus, built-in ring light, dual noise-reducing microphones. Plug-and-play USB-C.",
                new BigDecimal("89.99"), 30, electronics, seller),

            item("USB-C Hub 7-in-1",
                "Expand your laptop with 4K HDMI, 3× USB-A 3.0, SD & microSD reader, and 100W Power Delivery passthrough.",
                new BigDecimal("45.99"), 80, electronics, seller),

            item("Mechanical Gaming Keyboard",
                "Full-size mechanical keyboard with Cherry MX Red switches, per-key RGB lighting, and aluminium top plate.",
                new BigDecimal("74.99"), 25, electronics, seller),

            item("Smart Fitness Watch",
                "Track heart rate, SpO2, sleep, and 50+ workouts. 7-day battery, GPS, water resistant to 50m. iOS & Android.",
                new BigDecimal("59.99"), 60, electronics, seller),

            // Clothing (4)
            item("Classic Slim-Fit Chinos",
                "Tailored slim-fit chinos in premium stretch cotton blend. Wrinkle-resistant and machine washable. Sizes XS–3XL.",
                new BigDecimal("39.99"), 120, clothing, seller),

            item("Merino Wool Crew Sweater",
                "Lightweight 100% merino wool sweater — naturally temperature-regulating, soft on skin, and odor-resistant.",
                new BigDecimal("64.99"), 55, clothing, seller),

            item("Windproof Running Jacket",
                "Packable windproof jacket with reflective details, zip pockets, and mesh lining. Weighs only 180g.",
                new BigDecimal("49.99"), 40, clothing, seller),

            item("Linen Summer Dress",
                "Breezy 100% linen midi dress with relaxed fit, adjustable straps, and side pockets. Sizes XS–XL.",
                new BigDecimal("44.99"), 75, clothing, seller),

            // Books (3)
            item("Clean Code — Robert C. Martin",
                "A handbook of agile software craftsmanship. Learn to write readable, maintainable, and professional code.",
                new BigDecimal("32.99"), 200, books, seller),

            item("Designing Data-Intensive Applications",
                "The definitive guide to building reliable, scalable, and maintainable distributed systems. By Martin Kleppmann.",
                new BigDecimal("44.99"), 150, books, seller),

            item("The Pragmatic Programmer (20th Ed.)",
                "Timeless advice for software developers — from beginner to expert. Completely updated 20th anniversary edition.",
                new BigDecimal("29.99"), 180, books, seller),

            // Home & Garden (3)
            item("Bamboo Desk Organizer Set (5-pc)",
                "Five-piece eco-friendly bamboo desk organizer. Holds pens, notes, phone, and documents. Ships flat-packed.",
                new BigDecimal("28.99"), 70, homeGarden, seller),

            item("LED Desk Lamp with Wireless Charger",
                "Adjustable arm LED lamp with 5 brightness levels, touch control, USB-A port, and built-in 10W wireless charger.",
                new BigDecimal("39.99"), 90, homeGarden, seller),

            item("Indoor Plant Pot Set — Ceramic (3-pc)",
                "Set of 3 matte ceramic plant pots with drainage holes and matching saucers. Minimalist Scandinavian design.",
                new BigDecimal("26.99"), 65, homeGarden, seller),

            // Sports (3)
            item("Premium Yoga Mat 6mm",
                "Extra-wide non-slip eco-TPE yoga mat with alignment lines. Includes carrying strap and bag. 183×61cm.",
                new BigDecimal("24.99"), 100, sports, seller),

            item("Resistance Bands Set (5 levels)",
                "Loop resistance bands from 10 to 50 lbs for full-body workouts. Includes carry bag and illustrated guide.",
                new BigDecimal("19.99"), 150, sports, seller),

            item("Insulated Stainless Steel Bottle 1L",
                "Double-wall vacuum bottle keeps drinks cold 24h / hot 12h. Leak-proof lid, BPA-free, dishwasher safe.",
                new BigDecimal("22.99"), 200, sports, seller),

            // Beauty (2)
            item("Vitamin C Brightening Serum 30ml",
                "15% stabilised vitamin C with hyaluronic acid and vitamin E. Reduces dark spots, boosts collagen. Dermatologist tested.",
                new BigDecimal("18.99"), 80, beauty, seller),

            item("Natural Lip Balm Pack (4×)",
                "Beeswax lip balms in vanilla, peppermint, cherry, and coconut. SPF 15. No parabens or artificial colours.",
                new BigDecimal("12.99"), 250, beauty, seller),

            // Toys (2)
            item("STEM Building Blocks — 200 Pieces",
                "Creative interlocking building set for ages 6+. Develops spatial reasoning and engineering skills. BPA-free plastic.",
                new BigDecimal("34.99"), 60, toys, seller),

            item("Wooden Chess Set — Travel Size",
                "Compact folding chess board (25cm) with magnetic pieces. Perfect for travel. Includes instructions.",
                new BigDecimal("22.99"), 45, toys, seller),

            // Food (2)
            item("Organic Matcha Powder 100g",
                "Ceremonial-grade Japanese matcha from Uji, Kyoto. Stone-ground, rich umami, vibrant green. Resealable tin.",
                new BigDecimal("16.99"), 120, food, seller),

            item("Dark Chocolate Assortment Box (500g)",
                "24 premium dark chocolates with 70–85% cacao. Single-origin Ecuador, Peru, and Madagascar. Gift-ready box.",
                new BigDecimal("24.99"), 80, food, seller)
        );

        itemRepository.saveAll(items);
        log.info("✅ Seeded {} products across 8 categories.", items.size());
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("  Admin account  → admin@shopsphere.com / Admin1234!");
        log.info("  Seller account → seller@shopsphere.com / Seller1234!");
        log.info("  Buyer account  → buyer@shopsphere.com  / Buyer1234!");
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    // ── Fix DB constraint: allow NULL user_id for guest orders ────
    private void fixGuestOrderConstraint() {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE purchase_order MODIFY COLUMN user_id BIGINT NULL"
            );
            log.info("✅ purchase_order.user_id is now nullable — guest orders supported.");
        } catch (Exception e) {
            // Safe to ignore: column already nullable, or table not yet created
            log.debug("ALTER TABLE purchase_order skipped (already nullable or table pending): {}", e.getMessage());
        }
    }

    // ── Category seeding (runs on every startup) ─────────────────

    private void seedCategories() {
        Map<String, String> all = new LinkedHashMap<>();
        all.put("Electronics",          "Gadgets, devices, and accessories");
        all.put("Clothing",             "Fashion, apparel, and accessories");
        all.put("Books",                "Books, guides, and literature");
        all.put("Home & Garden",        "Home improvement and garden supplies");
        all.put("Sports",               "Sports, fitness, and outdoors");
        all.put("Beauty",               "Skincare, haircare, and personal care");
        all.put("Toys",                 "Toys and games for all ages");
        all.put("Food",                 "Snacks, pantry staples, and specialty foods");
        all.put("Health & Wellness",    "Vitamins, supplements, and wellness products");
        all.put("Automotive",           "Car accessories, tools, and maintenance products");
        all.put("Pet Supplies",         "Food, toys, and accessories for pets");
        all.put("Office & Stationery",  "Desk supplies, notebooks, and office equipment");
        all.put("Jewelry & Accessories","Rings, necklaces, bracelets, and watches");
        all.put("Baby & Kids",          "Clothing, toys, and essentials for children");
        all.put("Tools & Hardware",     "Power tools, hand tools, and building supplies");
        all.put("Art & Crafts",         "Painting, drawing, and DIY craft supplies");
        all.put("Travel & Luggage",     "Bags, suitcases, and travel accessories");
        all.put("Musical Instruments",  "Guitars, keyboards, drums, and accessories");
        all.forEach(this::getOrCreateCategory);
        log.info("✅ {} categories ready.", categoryRepository.count());
    }

    // ── Helpers ──────────────────────────────────────────────────

    private Role getOrCreateRole(RoleType type) {
        return roleRepository.findByName(type)
            .orElseGet(() -> roleRepository.save(Role.builder().name(type).build()));
    }

    private User createUser(String firstName, String lastName, String email, String rawPassword, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> userRepository.save(
            User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .enabled(true)
                .accountLocked(false)
                .role(role)
                .registrationDate(LocalDate.now())
                .build()
        ));
    }

    private Category getOrCreateCategory(String name, String description) {
        return categoryRepository.findByName(name).orElseGet(() -> {
            Category cat = new Category();
            cat.setName(name);
            cat.setDescription(description);
            return categoryRepository.save(cat);
        });
    }

    private Item item(String name, String description, BigDecimal price, int quantity, Category category, User seller) {
        return Item.builder()
            .name(name)
            .description(description)
            .price(price)
            .quantity(quantity)
            .category(category)
            .user(seller)
            .build();
    }
}
