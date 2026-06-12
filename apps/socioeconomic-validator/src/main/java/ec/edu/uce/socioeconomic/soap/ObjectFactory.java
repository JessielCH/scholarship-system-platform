package ec.edu.uce.socioeconomic.soap;

import jakarta.xml.bind.annotation.XmlRegistry;

@XmlRegistry
public class ObjectFactory {
    public ObjectFactory() {
    }

    public GetSocioeconomicDataRequest createGetSocioeconomicDataRequest() {
        return new GetSocioeconomicDataRequest();
    }

    public GetSocioeconomicDataResponse createGetSocioeconomicDataResponse() {
        return new GetSocioeconomicDataResponse();
    }
}
