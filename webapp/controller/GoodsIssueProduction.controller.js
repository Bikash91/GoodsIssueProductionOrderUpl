sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (Controller, MessageBox, JSONModel, Device) {
	"use strict";

	return Controller.extend("com.sap.upl.GoodsIssueProductionOrder.controller.GoodsIssueProduction", {
		onInit: function () {

			this.getOwnerComponent().getModel().getMetaModel().loaded()
				.then(function () {
					this.onlyNumber(this.byId("prnumber"));
					this.onlyNumber(this.byId("idMaterial"));
					jQuery.sap.delayedCall(400, this, function () {
						this.byId("prnumber").focus();
					});
					this.path = "/sap/fiori/zgoodsissueproductionorder/" + this.getOwnerComponent().getModel("soundModel").sServiceUrl +
						"/SoundFileSet('sapmsg1.mp3')/$value";
				}.bind(this)).catch(function () {
					MessageBox.error("Metadata loaded Failed!");
				}.bind(this));

		},

		onlyNumber: function (element) {
			element.attachBrowserEvent("keydown", (function (e) {
				var isModifierkeyPressed = (e.metaKey || e.ctrlKey || e.shiftKey);
				var isCursorMoveOrDeleteAction = ([46, 8, 37, 38, 39, 40, 9].indexOf(e.keyCode) !== -1);
				var isNumKeyPressed = (e.keyCode >= 48 && e.keyCode <= 58) || (e.keyCode >= 96 && e.keyCode <= 105);
				var vKey = 86,
					cKey = 67,
					aKey = 65;
				switch (true) {
				case isCursorMoveOrDeleteAction:
				case isModifierkeyPressed === false && isNumKeyPressed:
				case (e.metaKey || e.ctrlKey) && ([vKey, cKey, aKey].indexOf(e.keyCode) !== -1):
					break;
				default:
					e.preventDefault();
				}
			}));
		},

		onAfterRendering: function () {
			this.onlyNumber(this.byId("prnumber"));
			this.onlyNumber(this.byId("idMaterial"));
			jQuery.sap.delayedCall(400, this, function () {
				this.byId("prnumber").focus();
			});
		},

		onChangeEvnt: function (oEvt) {

			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
			}
			if (oEvt.getSource().getName() == "PRNumber") {
				if (this.byId("prnumber").getValue() != "") {
					this.onGettingPoItem();
				}
			} else if (oEvt.getSource().getName() == "Material") {
				if (this.byId("idMaterial").getValue() != "") {
					this.onChangeItem(oEvt.getSource().getValue());
				}
			} else if (oEvt.getSource().getName() == "GS1") {
				if (this.byId("gs1").getValue() != "") {
					var qrData = oEvt.getSource().getValue();
					if (oEvt.getSource().getValue() != "") {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", oEvt.getSource().getValue());
						qrData = qrData.split("(").join("-:-").split(")").join("-:-").split("-:-");
						var obj = {
							"241": "",
							"240": "",
							"30": "",
							"10": ""
						};
						for (var i = 0; i < qrData.length; i++) {
							if (qrData[i] == '241') {
								obj["241"] = qrData[i + 1];
							} else if (qrData[i] == '240') {
								obj["240"] = qrData[i + 1];
							} else if (qrData[i] == '30') {
								obj["30"] = qrData[i + 1];
							} else if (qrData[i] == '10' && qrData[i - 2] == '30') {
								if (qrData[i + 1] == undefined) {
									obj["10"] = "";
								} else {
									obj["10"] = qrData[i + 1];
								}

							}
						}
						if (obj["241"] == "" || obj["30"] == "") {
							jQuery.sap.delayedCall(400, this, function () {
								MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("invalidQRCode"), {
									icon: MessageBox.Icon.ERROR,
									title: "Error",
									contentWidth: "100px",
									onClose: function (oAction) {
										if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
											this.byId("gs1").focus();
											this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
											this.getOwnerComponent().getModel("settingsModel").refresh();
										}
									}.bind(this)
								});
							});
							return;
						}
						this.QRmaterial = obj["241"];
						this.QRquantity = obj["30"];
						this.QRmatDes = obj["240"];
						this.QRbatch = obj["10"];

						this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Material", this.QRmaterial);
						this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", this.QRbatch);
						this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", this.QRquantity);
						this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", false);
						this.getOwnerComponent().getModel("goodsIssueModel").refresh();
						this.getOwnerComponent().getModel("goodsIssueModel").updateBindings();
						this.onChangeItem(this.QRmaterial);
					} else {
						this.QRmaterial = "";
						this.QRquantity = "";
						this.QRmatDes = "";
						this.QRbatch = "";
						this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", oEvt.getSource().getValue());
						this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Material", this.QRmaterial);
						this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", this.QRbatch);
						this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", this.QRquantity);
						this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
						this.getOwnerComponent().getModel("goodsIssueModel").refresh();
						this.getOwnerComponent().getModel("goodsIssueModel").updateBindings();
					}

				} else {
					jQuery.sap.delayedCall(400, this, function () {
						this.byId("idMaterial").focus();
					});
					this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Material", "");
					this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", "");
					this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
					this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
					this.getOwnerComponent().getModel("goodsIssueModel").refresh();
					this.getOwnerComponent().getModel("goodsIssueModel").updateBindings();
				}
			} else if (oEvt.getSource().getName() == "Batch") {
				if (this.byId("batch").getValue() != "") {
					this.onChangeBatch(oEvt.getSource().getValue());
					/*this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", oEvt.getSource().getValue().toUpperCase());
					jQuery.sap.delayedCall(400, this, function () {
						this.byId("issueBin").focus();
					});*/
				}
			} else if (oEvt.getSource().getName() == "IssueBin") {
				if (this.byId("issueBin").getValue() != "") {
					this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", this.byId("issueBin").getValue().toUpperCase());
					// this.onCheckBinQuan(this.byId("issueBin").getValue());
					// this.onBinSubmit(oEvt.getSource().getValue());
				}
			} else if (oEvt.getSource().getName() == "Quantity") {
				if (this.byId("quant").getValue() != "") {
					this.onBinSubmit(oEvt.getSource().getValue());
				}
			}

			var Ponumber = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Ponumber");

			if (this.poItemQuan != undefined) {
				var POQuantity = this.poItemQuan.toString();
			}

			var Batch = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Batch");
			var UIQuantity = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Quantity");
			var Bin = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Storoagebin");
			var Plant = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Plant");
			var Material = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Material");

			if ((Ponumber != "" && POQuantity != "" && UIQuantity != "" && Bin != "" && Plant != "" && Material != "") && (Batch == "" || Batch !=
					"")) {
				this.CheckFields(Ponumber, POQuantity, Batch, UIQuantity, Bin, Plant, Material);
			}

		},

		onGettingPoItem: function () {
			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			this.Ponumber = this.byId("prnumber").getValue();
			var path = "/GoodsIssueHeaderSet('" + this.byId("prnumber").getValue() + "')";
			this.getOwnerComponent().getModel().read(path, {
				urlParameters: {
					$expand: 'GoodsIssueItemSet'
				},
				success: function (oData, oResponse) {

					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					this.checkGSEnabled(oData.GoodsIssueItemSet.results[0].Plant);
					/*oData.GoodsIssueItemSet.results[8].Batch = "0101";*/
					this.data = oData.GoodsIssueItemSet.results;
					for (var i = 0; i < this.data.length; i++) {
						if (parseFloat(this.data[i].Quantity) <= 0) {
							this.data.splice(i, 1);
						}
					}
					this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Ponumber", oData.Ponumber);
					this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Reservationno", oData.Reservationno);
					this.Reservationno = oData.Reservationno;
					for (var key in this.getOwnerComponent().getModel("goodsIssueModel").getData()) {
						if (key != "Ponumber" && key != "Reservationno") {
							this.getOwnerComponent().getModel("goodsIssueModel").getData()[key] = "";
						}
					}
					this.getOwnerComponent().getModel("goodsIssueModel").refresh();
					this.getOwnerComponent().getModel("goodsIssueModel").updateBindings();
				}.bind(this),
				error: function (error) {

					var audio = new Audio(this.path);
					audio.play();
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					});
					if (JSON.parse(error.responseText).error.innererror.errordetails.length > 1) {
						var x = JSON.parse(error.responseText).error.innererror.errordetails;
						var details = '<ul>';
						var y = '';
						if (x.length > 1) {
							for (var i = 0; i < x.length - 1; i++) {
								y = '<li>' + x[i].message + '</li>' + y;
							}
						}
						details = details + y + "</ul>";

						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("unabletogetPoData"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							details: details,
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction == "OK" || oAction == "CANCEL" || oAction == "CLOSE") {
									jQuery.sap.delayedCall(400, this, function () {
										this.byId("prnumber").focus();
									});
									for (var key in this.getOwnerComponent().getModel("goodsIssueModel").getData()) {
										this.getOwnerComponent().getModel("goodsIssueModel").getData()[key] = "";
									}
									this.getOwnerComponent().getModel("goodsIssueModel").refresh();
									this.getOwnerComponent().getModel("goodsIssueModel").updateBindings();
									this.data = [];
								}
							}.bind(this)
						});
					} else {
						MessageBox.error(JSON.parse(error.responseText).error.message.value, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									jQuery.sap.delayedCall(400, this, function () {
										this.byId("prnumber").focus();
									});
									for (var key in this.getOwnerComponent().getModel("goodsIssueModel").getData()) {
										this.getOwnerComponent().getModel("goodsIssueModel").getData()[key] = "";
									}
									this.getOwnerComponent().getModel("goodsIssueModel").refresh();
									this.getOwnerComponent().getModel("goodsIssueModel").updateBindings();
									this.data = [];
								}
							}.bind(this)
						});
					}
				}.bind(this)
			});
		},

		checkGSEnabled: function (plant) {
			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			var path = "/CheckGS1IndicatorSet(Plant='" + plant + "')";
			this.getOwnerComponent().getModel().read(path, {
				success: function (oData, oResponse) {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					if (oData.Gs1indicator == "X") {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Visible", true);
						jQuery.sap.delayedCall(400, this, function () {
							this.byId("gs1").focus();
						});
					} else {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Visible", false);
						jQuery.sap.delayedCall(400, this, function () {
							this.byId("idMaterial").focus();
						});
					}
				}.bind(this),
				error: function (error) {
					debugger;
					this.getErrorDetails(error, this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("error"));
				}.bind(this)
			});

		},

		onChangeItem: function (value) {
			var isMaterialExist = false;
			var materialResNo = 0;
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i].Material == value) {
					isMaterialExist = true;
					materialResNo = i;
					break;
				}
			}
			if (isMaterialExist != true) {
				var audio = new Audio(this.path);
				audio.play();
				this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);

				if (this.getOwnerComponent().getModel("settingsModel").getProperty("/GS1Value") != "") {
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("matNotExist"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									jQuery.sap.delayedCall(400, this, function () {
										this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
										this.byId("gs1").focus();
									});
									this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
									this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
									this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
									this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Material", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Unit", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Resitem", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storagelocation", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", "");
									this.getOwnerComponent().getModel("goodsIssueModel").refresh();
									this.poItemQuan = 0;
								}
							}.bind(this)
						});
					});

				} else {
					jQuery.sap.delayedCall(5000, this, function () {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("matNotExist"), {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							contentWidth: "100px",
							onClose: function (oAction) {
								if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
									jQuery.sap.delayedCall(400, this, function () {
										this.byId("idMaterial").focus();
									});
									this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
									this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
									this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
									this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Material", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Unit", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Resitem", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storagelocation", "");
									this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", "");
									this.getOwnerComponent().getModel("goodsIssueModel").refresh();
									this.poItemQuan = 0;

								}
							}.bind(this)
						});
					});
				}
				return;
			} else {
				this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Resitem", this.data[materialResNo].Resitem);
				this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Material", value);
				this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", this.data[materialResNo].Plant);
				this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storagelocation", this.data[materialResNo].Storagelocation);
				this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Unit", this.data[materialResNo].Unit);

				this.poItemQuan = parseFloat(this.data[materialResNo].Quantity);

				this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
				var batchCheck = "/CheckBatchedManagedSet(Material='" + this.getOwnerComponent().getModel("goodsIssueModel").getProperty(
					"/Material") + "',Ponumber='" + this.getOwnerComponent().getModel("goodsIssueModel").getProperty(
					"/Ponumber") + "')";
				this.getOwnerComponent().getModel().read(batchCheck, {
					success: function (oData, oResponse) {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						if (this.getOwnerComponent().getModel("settingsModel").getProperty("/GS1Value") != "") {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", false);
							/*if (oData.Batchmanaged) {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", true);
							} else {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
							}*/
							if (oData.Batchmanaged == true && this.QRbatch == "") {
								MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("matnotbatchManaged"), {
									icon: MessageBox.Icon.ERROR,
									title: "Error",
									contentWidth: "100px",
									onClose: function (oAction) {
										if (oAction == "OK" || oAction == "CANCEL" || oAction == "CLOSE") {
											jQuery.sap.delayedCall(400, this, function () {
												this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
												this.byId("gs1").focus();
											});
											this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
											this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
											this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
											this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Material", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Unit", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Resitem", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storagelocation", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", "");
											this.getOwnerComponent().getModel("goodsIssueModel").refresh();
											this.poItemQuan = 0;
										}
									}.bind(this)
								});
								return;
							} else if (oData.INDICATOR == false && this.QRbatch != "") {
								// MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("matisbatchmanaged"));
								MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("matisbatchmanaged"), {
									icon: MessageBox.Icon.ERROR,
									title: "Error",
									contentWidth: "100px",
									onClose: function (oAction) {
										if (oAction == "OK" || oAction == "CANCEL" || oAction == "CLOSE") {
											jQuery.sap.delayedCall(400, this, function () {
												this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
												this.byId("gs1").focus();
											});
											this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
											this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
											this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
											this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Material", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Unit", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Resitem", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storagelocation", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", "");
											this.getOwnerComponent().getModel("goodsIssueModel").refresh();
											this.poItemQuan = 0;
										}
									}.bind(this)
								});
								return;
							} else {
								if (this.QRbatch != "") {
									this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", true);
								} else {
									this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
								}
								jQuery.sap.delayedCall(400, this, function () {
									this.byId("issueBin").focus();
								});
							}

						} else {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", "");
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", "");
							if (oData.Batchmanaged) {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", true);
								jQuery.sap.delayedCall(400, this, function () {
									this.byId("batch").focus();
								});
							} else {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
								jQuery.sap.delayedCall(400, this, function () {
									this.byId("quant").focus();
								});
							}
						}

					}.bind(this),
					error: function (error) {
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
						this.getErrorDetails(error, this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("error"));
					}.bind(this)
				});
			}
		},
		onChangeBatch: function (value) {
			this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", value.toUpperCase());
			jQuery.sap.delayedCall(200, this, function () {
				this.byId("quant").focus();
			});
		},

		onCheckAllField: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
			}
			for (var key in this.getOwnerComponent().getModel("goodsIssueModel").getData()) {
				if (key != "Ponumber") {
					this.getOwnerComponent().getModel("goodsIssueModel").getData()[key] = "";
				}
			}
			this.getOwnerComponent().getModel("goodsIssueModel").refresh();
			this.getOwnerComponent().getModel("goodsIssueModel").updateBindings();
		},

		onBinSubmit: function (value) {
			//this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", value.toUpperCase());
			jQuery.sap.delayedCall(400, this, function () {
				this.byId("issueBin").focus();
			});
		},

		onCheckMat: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
			}
		},

		onCheckBatch: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", oEvt.getSource().getValue().toUpperCase());
				oEvt.getSource().setValueState("None");
			}
		},

		/*onCheckBin: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", oEvt.getSource().getValue().toUpperCase());
				oEvt.getSource().setValueState("None");
			}
		},*/

		onCheckQuan: function (oEvt) {
			if (oEvt.getSource().getValue() != "") {
				oEvt.getSource().setValueState("None");
			}
		},

		onCheckBinQuan: function () {
			debugger;
			// this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", value.toUpperCase());
			var bin = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Storoagebin").toUpperCase();
			var material = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Material");
			var batch = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Batch");
			var ponumber = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Ponumber");
			var resitem = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Resitem");
			var reservationNo = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Reservationno");
			/*var path = "/CheckBinSet(Storoagebin='" + bin + "',Material='" + "1630413" + "',Batch='" + "NOGUT3" + "',Ponumber='" + ponumber +
				"')";*/
			/*var path = "/CheckBinSet(Reservationno='" + reservationNo + "',Resitem='" + resitem + "',Storoagebin='" + bin + "',Material='" +
				material + "',Batch='" +
				batch + "',Ponumber='" + ponumber +
				"')";*/

			var fieldFilter, filter = [];
			fieldFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("Reservationno", sap.ui.model.FilterOperator.EQ, reservationNo),
					new sap.ui.model.Filter("Resitem", sap.ui.model.FilterOperator.EQ, resitem),
					new sap.ui.model.Filter("Storoagebin", sap.ui.model.FilterOperator.EQ, bin),
					new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, material),
					new sap.ui.model.Filter("Batch", sap.ui.model.FilterOperator.EQ, batch),
					new sap.ui.model.Filter("Ponumber", sap.ui.model.FilterOperator.EQ, ponumber)
				],
				and: true
			});
			filter.push(fieldFilter);

			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			this.getOwnerComponent().getModel().read("/CheckBinSet", {
				filters: filter,
				success: function (odata, oresponse) {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					this.availstock = odata.results[0].Availablestock;
					var audio = new Audio(this.path);
					if (parseFloat(this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Quantity")) > parseFloat(this.availstock)) {
						audio.play();
						this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
						jQuery.sap.delayedCall(5000, this, function () {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
							MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("quanExeed"), {
								icon: MessageBox.Icon.ERROR,
								title: "Error",
								contentWidth: "100px",
								onClose: function (oAction) {
									if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
										this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", "");
										/*this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Unit", "");
										this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storagelocation", "");
										this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", "");
										this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Warehouse", "");*/
										jQuery.sap.delayedCall(400, this, function () {
											this.byId("issueBin").focus();
										});

									}
								}.bind(this)
							});
						});
						return;
					} else {
						this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Unit", odata.results[0].Unit);
						this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storagelocation", odata.results[0].Storagelocation);
						this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", odata.results[0].Plant);
						this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Warehouse", odata.results[0].Warehouse);
						if (this.getOwnerComponent().getModel("poItemData").getProperty("/GoodsIssueItemSet").length > 0) {
							var data = this.getOwnerComponent().getModel("poItemData").getProperty("/GoodsIssueItemSet");
							var quan = 0;
							for (var i = 0; i < data.length; i++) {
								if (this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Material") == data[i].Material) {
									quan = quan + parseFloat(data[i].Quantity);
								}
							}
							quan = quan + parseFloat(this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Quantity"));
							if (parseFloat(this.availstock) < quan) {
								audio.play();
								this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
								jQuery.sap.delayedCall(5000, this, function () {
									this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
									MessageBox.error(
										this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("quanExeedPO"), {
											icon: MessageBox.Icon.ERROR,
											title: "Error",
											contentWidth: "100px",
											onClose: function (oAction) {
												if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
													this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", "");
													/*this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Unit", "");
													this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storagelocation", "");
													this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", "");
													this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Warehouse", "");*/
													jQuery.sap.delayedCall(400, this, function () {
														this.byId("issueBin").focus();
													});
												}
											}.bind(this)
										});
								});
								return;
							} else {
								this.addLineItem();
							}
						} else {
							this.addLineItem();
						}
					}
				}.bind(this),
				error: function (error) {
					this.getErrorDetails(error, this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("unAvailableStock"));
					jQuery.sap.delayedCall(400, this, function () {
						this.byId("quant").focus();
					});
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
					this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Unit", "");
					this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storagelocation", "");
					this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", "");
					this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Warehouse", "");
				}.bind(this)
			});

		},

		addLineItem: function (odata) {

			var count;
			var audio = new Audio(this.path);
			count = this.getFormField(this.byId("idgoodsIssue").getContent());
			if (count > 0) {
				audio.play();
				/*this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
				jQuery.sap.delayedCall(5000, this, function () {
					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					MessageBox.error("Please fill all the Mandatory fields.");
				});*/
				MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("fillAllMan"));
				return;
			}

			this.clearField(this.byId("idgoodsIssue").getContent());
			var quantity = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Quantity");
			var Material = this.getOwnerComponent().getModel("goodsIssueModel").getData().Material;
			var Batch = this.getOwnerComponent().getModel("goodsIssueModel").getData().Batch.toUpperCase();
			var Storoagebin = this.getOwnerComponent().getModel("goodsIssueModel").getData().Storoagebin.toUpperCase();
			var tableItem = this.getOwnerComponent().getModel("poItemData").getProperty("/GoodsIssueItemSet");
			var existmatQuan = 0;
			var updatedQuan = 0;
			var goodissuePo = null;

			/*for (var i = 0; i < this.data.length; i++) {
				if (this.data[i].Material == Material && this.data[i].Batch == Batch) {
					this.quan = parseFloat(this.data[i].Quantity);
					break;
				}
			}*/

			if (this.getOwnerComponent().getModel("poItemData").getProperty("/GoodsIssueItemSet").length == 0) {
				if (parseFloat(quantity) <= this.poItemQuan) {
					this.getOwnerComponent().getModel("poItemData").getData().GoodsIssueItemSet.push(this.getOwnerComponent().getModel(
						"goodsIssueModel").getData());
					this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
					goodissuePo = new JSONModel({
						Ponumber: this.Ponumber,
						Reservationno: this.Reservationno,
						Storoagebin: "",
						Availablestock: "",
						Destinationbin: "",
						Resitem: "",
						Warehouse: "",
						Material: "",
						Plant: "",
						Quantity: "",
						Storagelocation: "",
						Unit: "",
						Batch: ""
					});
					this.getOwnerComponent().setModel(goodissuePo, "goodsIssueModel");
					this.getOwnerComponent().getModel("goodsIssueModel").refresh();
					this.getOwnerComponent().getModel("goodsIssueModel").updateBindings();

					this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
					this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
					this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
					// this.getOwnerComponent().getModel("settingsModel").setProperty("/poquan", "");
					if (this.getOwnerComponent().getModel("settingsModel").getProperty("/GS1Visible")) {
						jQuery.sap.delayedCall(400, this, function () {
							this.getView().byId("gs1").focus();
						});
					} else {
						jQuery.sap.delayedCall(400, this, function () {
							this.getView().byId("idMaterial").focus();
						});
					}

				}
				this.getOwnerComponent().getModel("poItemData").refresh();
			} else {
				for (var j = 0; j < tableItem.length; j++) {
					if (tableItem[j].Material == Material && tableItem[j].Batch == Batch && tableItem[j].Storoagebin == Storoagebin) {
						for (var i = 0; i < tableItem.length; i++) {
							if (Material == tableItem[i].Material) {
								existmatQuan = existmatQuan + parseFloat(tableItem[i].Quantity);
							}
						}
						existmatQuan = existmatQuan + parseFloat(quantity);

						for (var k = 0; k < tableItem.length; k++) {
							if (Material == tableItem[k].Material && Batch == tableItem[k].Batch && Storoagebin == tableItem[k].Storoagebin) {
								updatedQuan = updatedQuan + parseFloat(tableItem[k].Quantity);
							}
						}

						updatedQuan = updatedQuan + parseFloat(quantity);

						if (existmatQuan <= parseFloat(this.poItemQuan)) {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
							this.getOwnerComponent().getModel("poItemData").getProperty("/GoodsIssueItemSet")[j].Quantity = updatedQuan.toString();
							this.getOwnerComponent().getModel("poItemData").refresh();
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Material", "");
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", "");
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Unit", "");
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Resitem", "");
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storagelocation", "");
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", "");
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", "");
							this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Warehouse", "");
							this.getOwnerComponent().getModel("goodsIssueModel").refresh();

							this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
							this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
							this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
							// this.getOwnerComponent().getModel("settingsModel").setProperty("/poquan", "");

							if (this.getOwnerComponent().getModel("settingsModel").getProperty("/GS1Visible")) {
								jQuery.sap.delayedCall(400, this, function () {
									this.getView().byId("gs1").focus();
								});
							} else {
								jQuery.sap.delayedCall(400, this, function () {
									this.getView().byId("idMaterial").focus();
								});
							}
							return;
						} else {
							audio.play();
							this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
							jQuery.sap.delayedCall(5000, this, function () {
								MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("quanMore"), {
									icon: MessageBox.Icon.ERROR,
									title: "Error",
									contentWidth: "100px",
									onClose: function (oAction) {
										if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
											this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", "");
											/*this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Unit", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storagelocation", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Warehouse", "");
											this.getOwnerComponent().getModel("goodsIssueModel").refresh();*/
											jQuery.sap.delayedCall(400, this, function () {
												this.byId("issueBin").focus();
											});
										}
									}.bind(this)
								});
							});
							return;
						}
						break;
					}
				}

				for (var k = 0; k < tableItem.length; k++) {
					if (tableItem[k].Material != Material || tableItem[k].Batch != Batch || tableItem[k].Storoagebin != Storoagebin) {
						for (var l = 0; l < tableItem.length; l++) {
							if (Material == tableItem[l].Material) {
								existmatQuan = existmatQuan + parseFloat(tableItem[l].Quantity);
							}
						}
						existmatQuan = existmatQuan + parseFloat(quantity);
						if (existmatQuan <= parseFloat(this.poItemQuan)) {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
							this.getOwnerComponent().getModel("poItemData").getData().GoodsIssueItemSet.push(this.getOwnerComponent().getModel(
								"goodsIssueModel").getData());
							this.getOwnerComponent().getModel("poItemData").refresh();
							goodissuePo = new JSONModel({
								Ponumber: this.Ponumber,
								Reservationno: this.Reservationno,
								Storoagebin: "",
								Availablestock: "",
								Destinationbin: "",
								Resitem: "",
								Warehouse: "",
								Material: "",
								Plant: "",
								Quantity: "",
								Storagelocation: "",
								Unit: "",
								Batch: ""
							});
							this.getOwnerComponent().setModel(goodissuePo, "goodsIssueModel");
							this.getOwnerComponent().getModel("goodsIssueModel").refresh();
							this.getOwnerComponent().getModel("goodsIssueModel").updateBindings();

							this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
							this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
							this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
							// this.getOwnerComponent().getModel("settingsModel").setProperty("/poquan", "");

							if (this.getOwnerComponent().getModel("settingsModel").getProperty("/GS1Visible")) {
								jQuery.sap.delayedCall(400, this, function () {
									this.getView().byId("gs1").focus();
								});
							} else {
								jQuery.sap.delayedCall(400, this, function () {
									this.getView().byId("idMaterial").focus();
								});
							}
						} else {
							audio.play();
							this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
							jQuery.sap.delayedCall(5000, this, function () {
								MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("quanExeed"), {
									icon: MessageBox.Icon.ERROR,
									title: "Error",
									contentWidth: "100px",
									onClose: function (oAction) {
										if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
											this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", "");
											/*this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Unit", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storagelocation", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", "");
											this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Warehouse", "");
											this.getOwnerComponent().getModel("goodsIssueModel").refresh();*/
											jQuery.sap.delayedCall(400, this, function () {
												this.byId("issueBin").focus();
											});
										}
									}.bind(this)
								});
							});
						}
						break;
					}
				}

			}

			if (this.getOwnerComponent().getModel("poItemData").getProperty("/GoodsIssueItemSet").length > 0) {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", true);
			} else {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", false);
			}
		},
		onDeleteLineItem: function (oEvent) {
			this.getOwnerComponent().getModel("poItemData").getProperty("/GoodsIssueItemSet").splice(oEvent.getSource().getId().split("-")[
				oEvent.getSource()
				.getId().split("-").length - 1], 1);
			this.getOwnerComponent().getModel("poItemData").refresh();
			jQuery.sap.delayedCall(400, this, function () {
				this.getView().byId("idMaterial").focus();
			});

			if (this.getOwnerComponent().getModel("poItemData").getProperty("/GoodsIssueItemSet").length > 0) {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", true);
			} else {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", false);
			}
		},

		onPressPost: function () {
			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			var sData = {
				"Ponumber": this.Ponumber,
				"GoodsIssueItemSet": []
			};

			sData.GoodsIssueItemSet = this.getOwnerComponent().getModel("poItemData").getProperty("/GoodsIssueItemSet");

			for (var i = 0; i < sData.GoodsIssueItemSet.length; i++) {
				if (sData.GoodsIssueItemSet[i].Availablestock != undefined) {
					delete sData.GoodsIssueItemSet[i].Availablestock;
				}

				sData.GoodsIssueItemSet[i].Quantity = sData.GoodsIssueItemSet[i].Quantity.toString();
			}

			this.getOwnerComponent().getModel().create("/GoodsIssueHeaderSet", sData, {
				success: function (oData, oResponse) {

					this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
					MessageBox.success(oData.Message, {
						icon: MessageBox.Icon.SUCCESS,
						title: "Success",
						contentWidth: "100px",
						onClose: function (oAction) {
							if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE" || oAction === null) {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);

								this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
								this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Visible", false);
								this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
								this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);

								this.getOwnerComponent().getModel("settingsModel").setProperty("/enablePost", false);
								for (var key in this.getOwnerComponent().getModel("goodsIssueModel").getData()) {
									this.getOwnerComponent().getModel("goodsIssueModel").getData()[key] = "";
								}
								this.getOwnerComponent().getModel("goodsIssueModel").refresh();
								this.getOwnerComponent().getModel("goodsIssueModel").updateBindings();
								this.getOwnerComponent().getModel("poItemData").getData().GoodsIssueItemSet = [];
								this.getOwnerComponent().getModel("poItemData").refresh();
								this.getOwnerComponent().getModel("poItemData").updateBindings();
								jQuery.sap.delayedCall(400, this, function () {
									this.byId("prnumber").focus();
								});
							}
						}.bind(this)
					});
				}.bind(this),
				error: function (error) {
					this.getErrorDetails(error, this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("unabletoCreatePo"));
				}.bind(this)
			});
		},

		CheckFields: function (Ponumber, POQuantity, Batch, UIQuantity, Bin, Plant, Material) {
			var fieldFilter, filter = [];
			fieldFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("Ponumber", sap.ui.model.FilterOperator.EQ, Ponumber),
					new sap.ui.model.Filter("POQuantity", sap.ui.model.FilterOperator.EQ, POQuantity),
					new sap.ui.model.Filter("Batch", sap.ui.model.FilterOperator.EQ, Batch),
					new sap.ui.model.Filter("UIQuantity", sap.ui.model.FilterOperator.EQ, UIQuantity),
					new sap.ui.model.Filter("Bin", sap.ui.model.FilterOperator.EQ, Bin),
					new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, Plant),
					new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, Material)
				],
				and: true
			});
			filter.push(fieldFilter);
			this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", true);
			this.getOwnerComponent().getModel().read("/CheckFieldsSet", {
				filters: filter,
				success: function (oData, oResponse) {
					debugger;
					var data = oData.results[0];
					var id;
					var audio = new Audio(this.path);
					if (this.getOwnerComponent().getModel("settingsModel").getProperty("/GS1Value") != "") {
						if (data.Type == 'E') {
							audio.play();
							jQuery.sap.delayedCall(5000, this, function () {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
								MessageBox.error(data.Message, {
									onClose: function (oAction) {
										if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
											if (data.Indicator == 'Material' || data.Indicator == 'Batch' || data.Indicator == 'UIQuantity' || data.Indicator ==
												'Plant') {
												this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Material", "");
												this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", "");
												this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
												this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Plant", "");
												this.getOwnerComponent().getModel("settingsModel").setProperty("/GS1Value", "");
												this.getOwnerComponent().getModel("settingsModel").setProperty("/gsPropertyenable", true);
												this.getOwnerComponent().getModel("settingsModel").setProperty("/showBatch", false);
												// this.getOwnerComponent().getModel("settingsModel").setProperty("/poquan", "");
												id = "gs1";
											} else if (data.Indicator == 'Bin') {
												this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", "");
												id = "issueBin";
											}
											jQuery.sap.delayedCall(400, this, function () {
												this.byId(id).focus();
											});
											this.getOwnerComponent().getModel("goodsIssueModel").refresh();
											this.getOwnerComponent().getModel("goodsIssueModel").updateBindings();
											this.getOwnerComponent().getModel("settingsModel").refresh();
										}
									}.bind(this)
								});
							});
						} else {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
							this.addLineItem();
						}
					} else {
						if (data.Type == 'E') {
							audio.play();
							jQuery.sap.delayedCall(5000, this, function () {
								this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
								MessageBox.error(data.Message, {
									onClose: function (oAction) {
										if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {
											if (data.Indicator == 'Material') {
												this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Material", "");
												id = "idMaterial";
											} else if (data.Indicator == 'Batch') {
												this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Batch", "");
												id = "batch";
											} else if (data.Indicator == 'UIQuantity') {
												this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Quantity", "");
												id = "quant";
											} else if (data.Indicator == 'Bin') {
												this.getOwnerComponent().getModel("goodsIssueModel").setProperty("/Storoagebin", "");
												id = "issueBin";
											}
											jQuery.sap.delayedCall(400, this, function () {
												this.byId(id).focus();
											});
											this.getOwnerComponent().getModel("goodsIssueModel").refresh();
											this.getOwnerComponent().getModel("goodsIssueModel").updateBindings();
											this.getOwnerComponent().getModel("settingsModel").refresh();
										}
									}.bind(this)
								});
							});
						} else {
							this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
							this.addLineItem();
						}
					}
				}.bind(this),
				error: function (error) {
					debugger;
					this.getErrorDetails(error, this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("error"));
				}.bind(this)
			});
		},

		getErrorDetails: function (error, data) {

			var audio = new Audio(this.path);
			audio.play();
			jQuery.sap.delayedCall(5000, this, function () {
				this.getOwnerComponent().getModel("settingsModel").setProperty("/busy", false);
			});
			if (JSON.parse(error.responseText).error.innererror.errordetails.length > 1) {
				var x = JSON.parse(error.responseText).error.innererror.errordetails;
				var details = '<ul>';
				var y = '';
				if (x.length > 1) {
					for (var i = 0; i < x.length - 1; i++) {
						y = '<li>' + x[i].message + '</li>' + y;
					}
				}
				details = details + y + "</ul>";

				MessageBox.error(data, {
					icon: MessageBox.Icon.ERROR,
					title: "Error",
					details: details,
					contentWidth: "100px",
					onClose: function (oAction) {
						if (oAction == "OK" || oAction == "CANCEL" || oAction == "CLOSE") {

						}
					}.bind(this)
				});
			} else {
				MessageBox.error(JSON.parse(error.responseText).error.message.value, {
					icon: MessageBox.Icon.ERROR,
					title: "Error",
					contentWidth: "100px",
					onClose: function (oAction) {
						if (oAction === "OK" || oAction === "CANCEL" || oAction === "CLOSE") {

						}
					}.bind(this)
				});
			}
		},

		handleValueHelpRequest: function (oEvent) {
			this.sInputValue = oEvent.getSource();
			this.inputIdMat = oEvent.getSource().getId().split("--")[1];
			var oPath = oEvent.getSource().getBindingInfo("suggestionItems").path;
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"com.sap.upl.GoodsIssueProductionOrder.fragments.SearchHelp",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}
			this._setListBinding(oPath, this.inputIdMat);
			this._valueHelpDialog.open();
		},

		_setListBinding: function (oPath, idInput) {

			switch (idInput) {
			case "issueBin":
				this.id = "issueBin";
				this.title = "Bin";
				this.desc = "Plant";
				this.text = "Issue Bin";
				break;
			default:
				return;
			}
			var oTemplate = new sap.m.StandardListItem({
				title: "{" + this.title + "}",
				description: "{" + this.desc + "}"
			});

			var aTempFlter = [];
			aTempFlter.push(new sap.ui.model.Filter([
					new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("goodsIssueModel").getProperty(
						"/Plant"))
				],
				true));
			this._valueHelpDialog.bindAggregation("items", oPath, oTemplate);
			this._valueHelpDialog.getBinding("items").filter(aTempFlter);

			this._valueHelpDialog.setTitle(this.text);
		},

		onOk: function (oEvent) {
			debugger;
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				this.sKey = oSelectedItem.getTitle();
				if (this.id === "issueBin") {
					this.getOwnerComponent().getModel("goodsIssueModel").setProperty(
						"/Storoagebin", this.sKey);
					jQuery.sap.delayedCall(400, this, function () {
						document.activeElement.blur();
					});
				}
			}
			this.sInputValue.setValueStateText("");
			this.sInputValue.setValueState("None");

			/*var Ponumber = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Ponumber");
			var POQuantity = this.poItemQuan;
			var Batch = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Batch");
			var UIQuantity = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Quantity");
			var Bin = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Storoagebin");
			var Plant = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Plant");
			var Material = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Material");

			if ((Ponumber != "" && POQuantity != "" && UIQuantity != "" && Bin != "" && Plant != "" && Material != "") && (Batch == "" || Batch !=
					"")) {
				this.CheckFields(Ponumber, POQuantity, Batch, UIQuantity, Bin, Plant, Material);
			}*/

			var Ponumber = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Ponumber");
			var POQuantity = this.poItemQuan.toString();
			var Batch = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Batch");
			var UIQuantity = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Quantity");
			var Bin = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Storoagebin");
			var Plant = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Plant");
			var Material = this.getOwnerComponent().getModel("goodsIssueModel").getProperty("/Material");

			if ((Ponumber != "" && POQuantity != "" && UIQuantity != "" && Bin != "" && Plant != "" && Material != "") && (Batch == "" || Batch !=
					"")) {
				//this.onCheckBinQuan();

				this.CheckFields(Ponumber, POQuantity, Batch, UIQuantity, Bin, Plant, Material);
			}

		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = [];
			if (sValue) {
				oFilter.push(new sap.ui.model.Filter([
						new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("goodsIssueModel").getProperty(
							"/Plant")),
						new sap.ui.model.Filter(this.title, sap.ui.model.FilterOperator.Contains, sValue)
					],
					true));
				evt.getSource().getBinding("items").filter(oFilter);
			} else {
				oFilter.push(new sap.ui.model.Filter([
						new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("goodsIssueModel").getProperty(
							"/Plant"))
					],
					true));
				evt.getSource().getBinding("items").filter(oFilter);
			}

		},

		clearField: function (oFormContent) {
			for (var i = 0; i < oFormContent.length; i++) {
				if (oFormContent[i].getMetadata()._sClassName === "sap.m.Input" || oFormContent[i].getMetadata()._sClassName ===
					"sap.m.DatePicker") {
					oFormContent[i].setValueState("None");
				}
			}
		},

		getFormField: function (oFormContent) {
			var c = 0;
			for (var i = 0; i < oFormContent.length; i++) {
				if (oFormContent[i].getMetadata()._sClassName === "sap.m.Input") {
					if (oFormContent[i].getValue() == "" && oFormContent[i].getVisible() == true && oFormContent[i].getRequired() == true) {
						oFormContent[i].setValueState("Error");
						oFormContent[i].setValueStateText(oFormContent[i - 1].getText() + " " + this.getOwnerComponent().getModel("i18n").getResourceBundle()
							.getText(
								"isMan"));
						oFormContent[i].focus();
						c++;
						return c;
						break;
					}
				}
			}
		}

	});

});