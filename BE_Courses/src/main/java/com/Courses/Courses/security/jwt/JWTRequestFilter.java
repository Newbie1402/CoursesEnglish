package com.Courses.Courses.security.jwt;
import com.Courses.Courses.service.CustomUserDetailService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JWTRequestFilter extends OncePerRequestFilter {

    @Autowired
    private CustomUserDetailService customUserDetailsService;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private JWTBlacklistService tokenBlackListService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");

        // Thêm log cho Authorization header
        System.out.println("Authorization header: " + authorizationHeader);

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);

            if (tokenBlackListService.isTokenBlacklisted(jwt)) {
                System.out.println("Blocked blacklisted token: " + jwt);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"unauthorized\",\"message\":\"Token is blacklisted\"}");
                return;
            }

            try {
                username = jwtUtil.extractUsername(jwt);
                // Thêm log cho username được trích xuất
                System.out.println("Extracted username: " + username);
            } catch (Exception e) {
                // Trả về lỗi 401 thay vì cho phép request tiếp tục
                System.err.println("Invalid token: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"unauthorized\",\"message\":\"Invalid or expired token\"}");
                return;
            }
        }
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    List<String> roles = jwtUtil.extractRoles(jwt);
                    List<GrantedAuthority> authorities = roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\":\"unauthorized\",\"message\":\"Invalid token\"}");
                    return;
                }
            } catch (Exception e) {
                System.err.println("Error during authentication: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"unauthorized\",\"message\":\"Authentication error\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
