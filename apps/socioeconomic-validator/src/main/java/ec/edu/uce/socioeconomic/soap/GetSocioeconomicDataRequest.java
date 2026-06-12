package ec.edu.uce.socioeconomic.soap;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "GetSocioeconomicDataRequest", namespace = "http://siise.gob.ec/ws")
@XmlAccessorType(XmlAccessType.FIELD)
public class GetSocioeconomicDataRequest {
    @XmlElement(namespace = "http://siise.gob.ec/ws")
    private String nationalId;

    public String getNationalId() {
        return nationalId;
    }

    public void setNationalId(String nationalId) {
        this.nationalId = nationalId;
    }
}
