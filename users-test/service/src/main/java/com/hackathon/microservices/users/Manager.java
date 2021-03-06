/*
 * This Java source file was generated by the Gradle 'init' task.
 */
package com.hackathon.microservices.users;

import com.hackathon.microservices.users.deploy.Deploy;

import java.util.Arrays;

public class Manager {
    private static String env;

    public static void main(String[] args) {
        System.out.println("Running users microservices manager with args:\n" + Arrays.toString(args));

        env = args[0];
        Deploy deploy = new Deploy();
        deploy.synth();
        deploy.start();
    }

    public static String withEnv(String name) {
        final String PROJECT_NAME = "gqlh";
        return String.format("%s-%s-%s", PROJECT_NAME, name, env);
    }
}
