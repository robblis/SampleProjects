/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.esri.geoportal.search;
import java.util.HashSet;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.container.Suspended;
import javax.ws.rs.core.Application;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.SecurityContext;


/**
 * OGC API: Records service provider.
 */
@ApplicationPath("ogcrecords")
@Path("")
public class OGCRecordsService extends Application {

  @Override
  public Set<Class<?>> getClasses() {
    Set<Class<?>> resources = new HashSet<Class<?>>();
    resources.add(OGCRecordsService.class);
    return resources;
  }

  @GET
  public void get(@Suspended final AsyncResponse asyncResponse, 
      @Context HttpServletRequest hsr) {
    new SearchRequest(asyncResponse).execute(hsr);
  }
  
  @POST
  @Consumes({MediaType.APPLICATION_FORM_URLENCODED})
  public void post(@Suspended final AsyncResponse asyncResponse,
      @Context HttpServletRequest hsr,
      MultivaluedMap<String, String> requestParams) {
    new SearchRequest(asyncResponse).execute(hsr,requestParams);
  }
  
  @GET
  @Path("/conformance")
  public void getConformance(@Suspended final AsyncResponse asyncResponse,
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr) {
    new SearchRequest(asyncResponse).execute(hsr);
  }
  
  @GET
  @Path("/collections")
  public void getCollections(@Suspended final AsyncResponse asyncResponse,
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr) {
    new SearchRequest(asyncResponse).execute(hsr);
  }
  
  @GET
  @Path("/collections/metadata")
  public void getCollectionMetadata(@Suspended final AsyncResponse asyncResponse,
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr) {
    new SearchRequest(asyncResponse).execute(hsr);
  }

  @GET
  @Path("/collections/metadata/items")
  public void getItem(@Suspended final AsyncResponse asyncResponse,
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr) {
    new SearchRequest(asyncResponse).execute(hsr);
  }
  
  @GET
  @Path("collections/metadata/queryables")
  public void getQueryables(@Suspended final AsyncResponse asyncResponse,
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr) {
    new SearchRequest(asyncResponse).execute(hsr);
  }

  @GET
  @Path("/api")
  public void getApi(@Suspended final AsyncResponse asyncResponse,
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr) {
    new SearchRequest(asyncResponse).execute(hsr);
  }
}
