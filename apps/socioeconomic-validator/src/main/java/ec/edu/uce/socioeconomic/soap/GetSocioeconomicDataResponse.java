package ec.edu.uce.socioeconomic.soap;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.math.BigDecimal;

@XmlRootElement(name = "GetSocioeconomicDataResponse", namespace = "http://siise.gob.ec/ws")
@XmlAccessorType(XmlAccessType.FIELD)
public class GetSocioeconomicDataResponse {
    @XmlElement(namespace = "http://siise.gob.ec/ws")
    private BigDecimal povertyIndex;

    @XmlElement(namespace = "http://siise.gob.ec/ws")
    private boolean isVulnerable;

    public BigDecimal getPovertyIndex() {
        return povertyIndex;
    }

    public void setPovertyIndex(BigDecimal povertyIndex) {
        this.povertyIndex = povertyIndex;
    }

    public boolean isVulnerable() {
        return isVulnerable;
    }

    public void setVulnerable(boolean vulnerable) {
        isVulnerable = vulnerable;
    }
}
