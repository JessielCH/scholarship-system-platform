package ec.edu.uce.socioeconomic.soap;

import org.springframework.ws.client.core.support.WebServiceGatewaySupport;
import org.springframework.ws.soap.client.core.SoapActionCallback;

public class SiiseSoapClient extends WebServiceGatewaySupport {

    public GetSocioeconomicDataResponse getSocioeconomicData(String nationalId) {
        GetSocioeconomicDataRequest request = new GetSocioeconomicDataRequest();
        request.setNationalId(nationalId);

        return (GetSocioeconomicDataResponse) getWebServiceTemplate()
                .marshalSendAndReceive("http://mock-siise-server.local/ws", request,
                        new SoapActionCallback("http://siise.gob.ec/ws/GetSocioeconomicData"));
    }
}
