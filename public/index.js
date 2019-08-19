(function ($) {
  'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

  function initGraf() {
    window.chartModel = {};
    window.uploadedData = {};

    $("#save-btn").click(function() {
      $("#myChart")
        .get(0)
        .toBlob(function(blob) {
          var subor = $('input[name="subor"]').val();
          saveAs(blob, subor + ".png");
        });
    });

    $('input[type="file"]').change(function(e) {
      var fileName = e.target.files[0].name;
      alert('Bol vybratý "' + fileName + '" súbor.');
    });

    // Global option
    Chart.defaults.global.defaultFontFamily = "Georgia";
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = "black";
    Chart.defaults.global.defaultFontStyle = "normal";
    Chart.defaults.global.responsive = true;

    var ctx = document.getElementById("myChart").getContext("2d");
    window.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        title: {
          display: false,
          text: "Analýza technologických dát o procese skujňovania",
          fontSize: 25,
          fontColor: "blue",
          fontStyle: "bold",
          padding: 5,
        },

        legend: {
          position: "top",
          display: true,
          fontStyle: "bold",
        },

        layout: {
          padding: {
            left: 20,
            top: 20,
            left: 0,
            bottom: 0,
          },
        },

        scales: {
          yAxes: [
            {
              gridLines: {
                display: true,
                color: "black",
                borderDash: [2],
              },
              ticks: {
                beginAtZero: true,
              },
              scaleLabel: {
                display: true,
                labelString: "Hodnoty",
                fontColor: "black",
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: true,
                color: "black",
                borderDash: [2],
              },
              scaleLabel: {
                display: true,
                labelString: "Čas(s)",
                fontColor: "black",
              },
              ticks: {
                beginAtZero: true,
                min: 0,
                stepSize: 50,
              },
            },
          ],
        },
        pan: {
          enabled: true,
          mode: "xy",
        },

        zoom: {
          enabled: true,
          mode: "xy",
        },
      },
    });
  }

  function renderChart(chartModel) {
    window.chart.options.legend.display = true;
    window.chart.options.title.display = true;
    window.chart.data.datasets = [];
    window.chart.data.labels = [];

    let maxLength = 0;

    for (let col in chartModel) {
      window.chart.data.datasets.push({
        data: chartModel[col].data,
        label: chartModel[col].label,
        fill: false,
        backgroundColor: "transparent",
        borderColor: chartModel[col].borderColor,
        borderWidth: 1,
      });

      if (maxLength < chartModel[col].data.length) maxLength = chartModel[col].data.length;
    }

    for (let i = 0; i < maxLength; i++) {
      window.chart.data.labels.push(i);
    }

    // window.chart.data.labels = [0];
    // let count = 0;
    // while (count < maxLength) {
    //   if (count % 25) {
    //     window.chart.data.labels.push(window.chart.data.labels[i] + 25)
    // }
    // for (let i = 0; i < maxLength; i++) {
    //   window.chart.data.labels.push(window.chart.data.labels[i] + 25)
    // }

    window.chart.options.scales = {
      xAxes: [
        {
          gridLines: {
            display: true,
            color: "black",
            borderDash: [2],
          },
          scaleLabel: {
            display: true,
            labelString: "Čas(s)",
            fontColor: "black",
          },
          ticks: {
            beginAtZero: true,
            userCallback: function(item, index) {
              if (!(index % 0.5)) return item;
            },
            min: 0,
            max: 500,
            stepSize: 50,
          },
        },
      ],
    };

    window.chart.update();
  }

  var config = {
    frontendUrl: 'http://localhost:3000',
    backendUrl: 'http://localhost:3000'
  };

  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function registerUploadFile() {
    $("#but_upload").click(function() {
      var formData = new FormData();
      var file = $("#file")[0].files[0];
      console.log(file);
      formData.append("file", file);

      fetch(`${config.backendUrl}/api/upload`, {
        method: "POST",
        mode: "cors",
        body: formData,
      })
        .then(res => res.json())
        .then(response => {
          console.log(response);
          if (response && response != 0) {
            console.log("response: ", response);
            window.myJSONData = response.data;

            var fileName = $("input[type=file]")
              .val()
              .split("\\")
              .pop();
            $("#target").attr("value", "Súbor: " + fileName);

            let novyRiadok = $("#vkladanie").clone();
            novyRiadok.removeClass("d-none");
            novyRiadok.addClass("div-css");

            // Pridanie nového ID pre novyRiadok
            let n = $(".col").length;
            let div_id = "div-id" + n++;

            novyRiadok.attr("id", function() {
              return div_id;
            });

            if (response.data && response.data[0]) {
              // Pridanie stĺpcov do dropdownu
              const columns = Object.keys(response.data[0]);
              for (let i = 0; i < columns.length; i++) {
                const option = "<option>" + columns[i] + "</option>";
                novyRiadok.find(".selectpicker").append(option);
              }

              // Pridanie multiselectu
              novyRiadok.find(".selectpicker").selectpicker();
              novyRiadok
                .find("button[role='button']")
                .last()
                .remove();

              // Pridanie nového riadku
              novyRiadok.appendTo($(".row"));

              // Zmazanie riadku
              let riadok = novyRiadok;
              riadok.find("#delete-novyRiadok").click(function() {
                $("#" + novyRiadok.attr("id")).remove();
                alert("Súbor bol zmazaný.");
              });

              // Pridanie do grafu
              let dataObject = {};
              for (let i = 0; i < response.data.length; i++) {
                // Prechádzanie riadkov odpovede
                let row = response.data[i]; // Uloženie jedného riadku do premennej row, riadok má tvar objektu
                for (let key in row) {
                  if (!dataObject[key]) {
                    dataObject[key] = [];
                  }
                  dataObject[key].push(parseFloat(row[key])); // Urobí atribút s názvom akutálneho stĺpca
                }
              }

              window.uploadedData[fileName] = dataObject;

              riadok.find("#add-to-chart").click(function() {
                let stlpcestring = $("#" + novyRiadok.attr("id"))
                  .find(".btn.dropdown-toggle.btn-light")
                  .attr("title");
                let stlpce = stlpcestring.split(", ");

                for (let i = 0; i < stlpce.length; i++) {
                  window.chartModel[fileName + "_" + stlpce[i]] = {
                    data: window.uploadedData[fileName][stlpce[i]],
                    label: fileName + "_" + stlpce[i],
                    borderColor: getRandomColor(),
                  };
                }

                renderChart(chartModel);
              });

              riadok.find("#sum_co_co2").click(function() {
                let stlpcestring = $("#" + novyRiadok.attr("id"))
                  .find(".btn.dropdown-toggle.btn-light")
                  .attr("title");
                let stlpce = stlpcestring.split(", ");

                // for (let i = 0; i < stlpce.length; i++){
                //     window.chartModel[fileName + "_" + stlpce[i]] =
                // }

                // let pole1 = [];
                // let pole2 = [];
                // let vysledok = [];

                // for(let i = 0; i < stlpce.length; i++){
                //     window.chartModel[fileName + "_" + stlpce[i]] = pole1.push(stlpce[i].length);
                //     window.chartModel[fileName + "_" + stlpce[i]] = pole2.push(stlpce[i].length);

                //     pole1 =  array[i].val();
                // }
                // for(var i = 0; i < pole1.length; i++){
                //    vysledok.push(pole1[i] + pole2[i]);
                // }

                // console.log("Výsledný stĺpec: ", stlpce.length);
              });

              // Zmazanie z grafu
              riadok.find("#delete-from-chart").click(function() {
                let stlpcestring = $("#" + novyRiadok.attr("id"))
                  .find(".btn.dropdown-toggle.btn-light")
                  .attr("title");
                let stlpce = stlpcestring.split(", ");

                for (let i = 0; i < stlpce.length; i++) {
                  delete window.chartModel[fileName + "_" + stlpce[i]];
                }

                renderChart(chartModel);
              });

              alert("Súbor bol úspešne nahraný! ", response);
            }
          } else {
            alert("Súbor sa nenahral!");
          }
        })
        .catch(error => console.error("Error:", error));
    });
  }

  registerUploadFile();
  initGraf();

}($));