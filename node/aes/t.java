       String plainText = "OPENAPI1652150952564";
       try {
           MessageDigest md5 = MessageDigest.getInstance("MD5");
           byte[] keyBytes = md5.digest("Cube".getBytes("UTF-8"));
           Key ckey = new SecretKeySpec(keyBytes, "AES");
           Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
           IvParameterSpec iv = new IvParameterSpec(IV.getBytes("UTF-8"));
           cipher.init(Cipher.ENCRYPT_MODE, ckey,iv);
           byte[] inputByteArray = plainText.getBytes("UTF-8");
           System.out.println(Hex.toHexString(cipher.doFinal(inputByteArray)));
       } catch (Exception e) {
           e.printStackTrace();
       }