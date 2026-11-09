package co.edu.corhuila.taskmanager.auth.controller;

import static co.edu.corhuila.taskmanager.ApiTestSupport.credentials;
import static co.edu.corhuila.taskmanager.ApiTestSupport.uniqueEmail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** BCrypt rejects passwords over 72 bytes; the API must answer 400, never 500. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RegisterPasswordBytesIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("BR-61: 72 characters that take more than 72 bytes return 400, not 500")
    void register_withMultibytePasswordOver72Bytes_returns400() throws Exception {
        String password = "ñ".repeat(70) + "a1"; // 72 characters, 142 bytes
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(uniqueEmail(), password)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.details[0].field").value("password"));
    }

    @Test
    @DisplayName("BR-61: a password with accented letters within 72 bytes is still accepted")
    void register_withMultibytePasswordWithin72Bytes_returns201() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(uniqueEmail(), "contraseña1")))
                .andExpect(status().isCreated());
    }
}
