package ch.hsr.mixtape.webapp;

import java.lang.reflect.Type;

import cern.colt.Arrays;

import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import com.sun.jersey.core.util.Base64;

public class ByteArrayToBase64TypeAdapter implements JsonSerializer<byte[]>,
		JsonDeserializer<byte[]> {

	@Override
	public byte[] deserialize(JsonElement json, Type typeOfT,
			JsonDeserializationContext context) throws JsonParseException {
		return Base64.decode(json.getAsString());
	}

	@Override
	public JsonElement serialize(byte[] src, Type typeOfSrc,
			JsonSerializationContext context) {
		return new JsonPrimitive(Arrays.toString(Base64.encode(src)));
	}

}