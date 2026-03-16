package com.AeiselDev.TunisiCart.Configs;

import java.util.Optional;

import com.AeiselDev.TunisiCart.entities.User;
import org.springframework.data.domain.AuditorAware;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


public class ApplicationAuditAware implements AuditorAware<Long> {
        @Override
        @NonNull
        public Optional<Long> getCurrentAuditor() {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null ||
                    !authentication.isAuthenticated() ||
                    authentication instanceof AnonymousAuthenticationToken) {
                return Optional.empty();
            }

            User userPrincipal = (User) authentication.getPrincipal();

            return Optional.of(userPrincipal.getId());
        }
    }
