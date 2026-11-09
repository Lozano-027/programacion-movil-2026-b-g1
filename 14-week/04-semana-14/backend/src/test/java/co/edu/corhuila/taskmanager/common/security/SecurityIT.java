package co.edu.corhuila.taskmanager.common.security;

import static co.edu.corhuila.taskmanager.ApiTestSupport.bearer;
import static co.edu.corhuila.taskmanager.ApiTestSupport.registerAndGetToken;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Week 14: end-to-end checks of the JWT flow and the CORS policy used by the SPA.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIT {

    private static final String TEST_SECRET = "test-secret-for-automated-tests-only-0123456789";
    private static final String SPA_ORIGIN = "http://localhost:5173";

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("JWT: the token returned by the API opens a protected endpoint")
    void validToken_returns200() throws Exception {
        String token = registerAndGetToken(mockMvc);

        mockMvc.perform(get("/api/v1/tasks").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("JWT error: a token signed with another secret returns 401")
    void tokenWithWrongSignature_returns401() throws Exception {
        String forged = Jwts.builder()
                .subject(UUID.randomUUID().toString())
                .claim("email", "attacker@test.local")
                .claim("role", "ADMIN")
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(Keys.hmacShaKeyFor(
                        "a-different-secret-that-the-api-does-not-know-0123".getBytes(StandardCharsets.UTF_8)))
                .compact();

        mockMvc.perform(get("/api/v1/tasks").header(HttpHeaders.AUTHORIZATION, bearer(forged)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("JWT error: an expired token returns 401")
    void expiredToken_returns401() throws Exception {
        Instant past = Instant.now().minusSeconds(7200);
        String expired = Jwts.builder()
                .subject(UUID.randomUUID().toString())
                .claim("email", "old@test.local")
                .claim("role", "USER")
                .issuedAt(Date.from(past))
                .expiration(Date.from(past.plusSeconds(60)))
                .signWith(Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();

        mockMvc.perform(get("/api/v1/tasks").header(HttpHeaders.AUTHORIZATION, bearer(expired)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CORS: the SPA origin passes the preflight request")
    void corsPreflight_fromSpaOrigin_isAllowed() throws Exception {
        mockMvc.perform(options("/api/v1/tasks")
                        .header(HttpHeaders.ORIGIN, SPA_ORIGIN)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, SPA_ORIGIN));
    }

    @Test
    @DisplayName("CORS error: an unknown origin is rejected with 403")
    void corsPreflight_fromUnknownOrigin_isRejected() throws Exception {
        mockMvc.perform(options("/api/v1/tasks")
                        .header(HttpHeaders.ORIGIN, "http://evil.example.com")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isForbidden());
    }
}
