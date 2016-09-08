package com.rmdev.core.utils;

import java.util.Date;
public class DateUtils {

	public static void main(String[] args) {
		
		System.out.println("The current date is:");
		System.out.println(getLocalCurrentDate());
		System.out.println("That was the current date:");


	}
	
	
	private static Date getLocalCurrentDate() {
		return new Date();
	}

}
