$(function () {
   

    Morris.Area({
        element: 'morris-area-chart',
        data: [{
            period: '22-09-2018' ,
            S1: 10,
            S2: 11,
            S3: 12
        }, {
                period: '21-09-2018',
            S1: 10.5,
            S2: 12,
            S3: 10
            }, {
                period: '23-09-2018',
            S1: 11,
            S2: 12,
            S3: 15
            }, {
                period: '20-09-2018',
            S1: 11,
            S2: 10,
            S3: 8
            }, {
                period: '19-09-2018',
            S1: 14,
            S2: 12,
            S3: 15
        }
        ],
        xkey: 'period',
        ykeys: ['S1', 'S2', 'S3'],
        labels: ['S1', 'S2', 'S3'],
        pointSize: 2,
        hideHover: 'auto',
        resize: true
    });

   
});
