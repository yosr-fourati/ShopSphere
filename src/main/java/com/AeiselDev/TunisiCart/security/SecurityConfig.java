package com.AeiselDev.TunisiCart.security;


import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static com.AeiselDev.TunisiCart.entities.Permission.*;
import static com.AeiselDev.TunisiCart.enums.RoleType.*;
import static org.springframework.security.config.Customizer.withDefaults;
import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfig {

    private final JwtFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(req ->
                        req.requestMatchers(
                                        "/auth/**",
                                        "/v2/api-docs",
                                        "/v3/api-docs",
                                        "/v3/api-docs/**",
                                        "/swagger-resources",
                                        "/swagger-resources/**",
                                        "/configuration/ui",
                                        "/configuration/security",
                                        "/swagger-ui/**",
                                        "/webjars/**",
                                        "/swagger-ui.html",
                                        "/public/**",
                                        "/image/**",
                                        "/feedback/**",
                                        "/auth/refresh-token" // Permit access to this specific endpoint

                                )
                                .permitAll()
                                .requestMatchers("/admin/**").hasRole(ADMIN.name())
                                .requestMatchers(HttpMethod.GET, "/admin/**").hasAnyAuthority(ADMIN_READ.name())
                                .requestMatchers(HttpMethod.POST, "/admin/**").hasAuthority(ADMIN_CREATE.name())
                                .requestMatchers(HttpMethod.PUT, "/admin/**").hasAuthority(ADMIN_UPDATE.name())
                                .requestMatchers(HttpMethod.DELETE, "/admin/**").hasAuthority(ADMIN_DELETE.name())
                                .requestMatchers("/user/**").hasRole(USER.name())
                                .requestMatchers(HttpMethod.GET, "/user/**").hasAuthority(USER_READ.name())
                                .requestMatchers(HttpMethod.POST, "/user/**").hasAuthority(USER_CREATE.name())
                                .requestMatchers(HttpMethod.PUT, "/user/**").hasAuthority(USER_UPDATE.name())
                                .requestMatchers(HttpMethod.DELETE, "/user/**").hasAuthority(USER_DELETE.name())
                                .requestMatchers("/seller/**").hasRole(SELLER.name())
                                .requestMatchers(HttpMethod.GET, "/seller/**").hasAuthority(SELLER_READ.name())
                                .requestMatchers(HttpMethod.POST, "/seller/**").hasAuthority(SELLER_CREATE.name())
                                .requestMatchers(HttpMethod.PUT, "/seller/**").hasAuthority(SELLER_UPDATE.name())
                                .requestMatchers(HttpMethod.DELETE, "/seller/**").hasAuthority(SELLER_DELETE.name())
                                .requestMatchers("/profile/**").hasAnyRole("USER", "ADMIN", "SELLER")
                                .anyRequest()
                                .authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}