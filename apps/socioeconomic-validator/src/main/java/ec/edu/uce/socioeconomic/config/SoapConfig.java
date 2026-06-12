package ec.edu.uce.socioeconomic.config;

import ec.edu.uce.socioeconomic.soap.SiiseSoapClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.oxm.jaxb.Jaxb2Marshaller;

@Configuration
public class SoapConfig {

    @Bean
    public Jaxb2Marshaller marshaller() {
        Jaxb2Marshaller marshaller = new Jaxb2Marshaller();
        marshaller.setContextPath("ec.edu.uce.socioeconomic.soap");
        return marshaller;
    }

    @Bean
    public SiiseSoapClient siiseSoapClient(Jaxb2Marshaller marshaller) {
        SiiseSoapClient client = new SiiseSoapClient();
        client.setDefaultUri("http://mock-siise-server.local/ws");
        client.setMarshaller(marshaller);
        client.setUnmarshaller(marshaller);
        return client;
    }
}
