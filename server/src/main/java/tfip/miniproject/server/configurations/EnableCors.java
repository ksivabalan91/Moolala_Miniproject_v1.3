package tfip.miniproject.server.configurations;

import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

public class EnableCors implements WebMvcConfigurer{
    final String path;
    final String origins;

    public EnableCors(String path, String origins){
        this.path = path;
        this.origins = origins;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping(path).allowedOrigins(origins).allowedMethods("PUT", "DELETE", "GET", "POST").allowedHeaders("*");        
    }   
    
}