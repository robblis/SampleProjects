//
//  ViewController.swift
//  esriPointTest
//
//  Created by Teddy Matinde on 2/22/17.
//  Copyright © 2017 Teddy Matinde. All rights reserved.
//

import UIKit
import ArcGIS

class ViewController: UIViewController, AGSGeoViewTouchDelegate, AGSPopupsViewControllerDelegate {
    
    
    @IBOutlet weak var mapView: AGSMapView!
    private weak var graphicsOverlay : AGSGraphicsOverlay!
 

    override func viewDidLoad() {
        super.viewDidLoad()
       
        
        let agsMap:AGSMap = AGSMap.init(basemap: AGSBasemap.imagery())
        
        self.mapView.map = agsMap;
        self.mapView.touchDelegate = self;
        
        var g = AGSGraphicsOverlay();
        
        self.graphicsOverlay = g
        let mySpatialReference = AGSSpatialReference.init(wkid: 4326)
        
        let myGeometry = AGSPoint.init(x: 0.0, y: 0.0, spatialReference: mySpatialReference)
        let mySymbol = AGSSimpleMarkerSymbol(style: AGSSimpleMarkerSymbolStyle.circle, color: UIColor.white, size: 10.0)
        var myAttributes = ["c": "12345678"]
        myAttributes["a"] = "abcdefg"
        myAttributes["b"] = "123456"
        let myGraphic = AGSGraphic.init(geometry: myGeometry, symbol: mySymbol, attributes: myAttributes);
        g.graphics.add(myGraphic)
        self.mapView.graphicsOverlays.add(g)
        
    }
    
    func geoView(_ geoView: AGSGeoView, didTapAtScreenPoint screenPoint: CGPoint, mapPoint: AGSPoint) {
        //use the following method to identify graphics in a specific graphics overlay
        //otherwise if you need to identify on all the graphics overlay present in the map view
        //use `identifyGraphicsOverlaysAtScreenCoordinate:tolerance:maximumGraphics:completion:` method provided on map view
        let tolerance:Double = 12
        
        self.mapView.identify(self.graphicsOverlay, screenPoint: screenPoint, tolerance: tolerance, returnPopupsOnly: false, maximumResults: 10) { (result: AGSIdentifyGraphicsOverlayResult) -> Void in
            if let error = result.error {
                print("error while identifying :: \(error.localizedDescription)")
            }
            else {
                //if a graphics is found then show an alert
                if result.graphics.count > 0 {
                    print("GRAPHICS COUNT = " + String(result.graphics.count))
                    //SVProgressHUD.showInfo(withStatus: "Tapped on graphic", maskType: .gradient)
                }
            }
        }
    }
  
    

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

